import { useState, useCallback, useEffect } from 'react';

export interface ViewportMatch {
    id: string;
    index: number;
    text: string;
    element: HTMLElement; // The first element of the match (for scrolling)
}

interface TextNodeMap {
    node: Text;
    start: number; // Start index in the full concatenated text
    end: number;   // End index in the full concatenated text
    originalText: string;
}

export function useReaderSearch(containerRef: React.RefObject<HTMLElement | null>) {
    const [matches, setMatches] = useState<ViewportMatch[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Clear all highlights
    const clearHighlights = useCallback(() => {
        if (!containerRef.current) return;

        // Remove highlights by stripping the span wrappers but keeping text
        // We select both standard and active highlights
        const highlights = containerRef.current.querySelectorAll('.search-highlight, .search-highlight-active');

        highlights.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                // Replace the span with its text content
                const text = el.textContent || '';
                const textNode = document.createTextNode(text);
                parent.replaceChild(textNode, el);
                // Optimization: calling normalize() on parent merges adjacent text nodes
                parent.normalize();
            }
        });

        setMatches([]);
        setCurrentMatchIndex(-1);
    }, [containerRef]);

    // Re-implementing search logic to be safe with reverse iteration
    const searchRobust = useCallback((query: string) => {
        if (!query || !containerRef.current || query.length < 2) {
            clearHighlights();
            setSearchQuery('');
            return;
        }

        clearHighlights();
        setSearchQuery(query);
        setIsSearching(true);

        const textNodes: TextNodeMap[] = [];
        let fullText = '';

        const walker = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.offsetParent === null) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let currentNode = walker.nextNode();
        while (currentNode) {
            const text = currentNode.textContent || '';
            const start = fullText.length;
            fullText += text;
            textNodes.push({
                node: currentNode as Text,
                start: start,
                end: fullText.length,
                originalText: text
            });
            currentNode = walker.nextNode();
        }

        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const rawMatches: { start: number; end: number; text: string }[] = [];
        let match;
        while ((match = regex.exec(fullText)) !== null) {
            rawMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }

        if (rawMatches.length === 0) {
            setIsSearching(false);
            setMatches([]);
            return;
        }

        const newMatches: ViewportMatch[] = [];

        // Process in REVERSE to avoid invalidating previous node references/offsets
        for (let i = rawMatches.length - 1; i >= 0; i--) {
            const m = rawMatches[i];
            const matchId = `search-match-${i}`; // ID is still index based

            const startNodeIndex = textNodes.findIndex(n => m.start >= n.start && m.start < n.end);
            const endNodeIndex = textNodes.findIndex(n => m.end > n.start && m.end <= n.end);

            if (startNodeIndex === -1 || endNodeIndex === -1) {
                console.warn(`Could not map match ${i} to nodes`, m);
                continue;
            }

            const startNodeMap = textNodes[startNodeIndex];
            const endNodeMap = textNodes[endNodeIndex];

            // Chunks to highlight
            const chunks: { node: Text, start: number, end: number }[] = [];

            if (startNodeIndex === endNodeIndex) {
                chunks.push({
                    node: startNodeMap.node,
                    start: m.start - startNodeMap.start,
                    end: m.end - startNodeMap.start
                });
            } else {
                // End node first
                chunks.push({
                    node: endNodeMap.node,
                    start: 0,
                    end: m.end - endNodeMap.start
                });

                // Middle parts
                for (let j = endNodeIndex - 1; j > startNodeIndex; j--) {
                    chunks.push({
                        node: textNodes[j].node,
                        start: 0,
                        end: textNodes[j].node.length
                    });
                }

                // Start part
                chunks.push({
                    node: startNodeMap.node,
                    start: m.start - startNodeMap.start,
                    end: startNodeMap.node.length
                });
            }

            let matchElement: HTMLElement | null = null;

            chunks.forEach(chunk => {
                try {
                    const range = document.createRange();
                    range.setStart(chunk.node, chunk.start);
                    range.setEnd(chunk.node, chunk.end);

                    const span = document.createElement('span');
                    span.className = 'search-highlight bg-yellow-200 text-black transition-colors duration-200';
                    span.dataset.matchId = matchId;
                    if (matchId === `search-match-${i}`) span.id = matchId;

                    range.surroundContents(span);
                    matchElement = span;
                } catch (e) {
                    console.error('Highlight error', e);
                }
            });

            if (matchElement) {
                newMatches.unshift({
                    id: matchId,
                    index: i,
                    text: m.text,
                    element: matchElement
                });
            }
        }

        setMatches(newMatches);
        if (newMatches.length > 0) {
            setCurrentMatchIndex(0);
            highlightCurrent(0, newMatches);
        } else {
            setCurrentMatchIndex(-1);
        }
        setIsSearching(false);

    }, [containerRef, clearHighlights]);


    // Highlight the current match
    const highlightCurrent = useCallback((index: number, currentMatches = matches) => {
        if (index < 0 || index >= currentMatches.length) return;

        // Remove active class from previous active SPANS (all chunks)
        const prevActive = containerRef.current?.querySelectorAll('.search-highlight-active');
        prevActive?.forEach(el => {
            el.classList.remove('search-highlight-active', 'bg-orange-400');
            el.classList.add('bg-yellow-200');
        });

        const match = currentMatches[index];
        // Find all spans for this match ID
        const matchSpans = containerRef.current?.querySelectorAll(`[data-match-id="${match.id}"]`);

        if (matchSpans && matchSpans.length > 0) {
            matchSpans.forEach(el => {
                el.classList.remove('bg-yellow-200');
                el.classList.add('search-highlight-active', 'bg-orange-400');
            });
            // Scroll to the first one
            matchSpans[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [matches, containerRef]);

    // Navigation
    const nextMatch = useCallback(() => {
        if (matches.length === 0) return;
        const nextIndex = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(nextIndex);
        highlightCurrent(nextIndex);
    }, [matches, currentMatchIndex, highlightCurrent]);

    const prevMatch = useCallback(() => {
        if (matches.length === 0) return;
        const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        setCurrentMatchIndex(prevIndex);
        highlightCurrent(prevIndex);
    }, [matches, currentMatchIndex, highlightCurrent]);

    // Clear on unmount
    useEffect(() => {
        return () => clearHighlights();
    }, [clearHighlights]);

    return {
        search: searchRobust,
        clear: clearHighlights,
        matches,
        currentMatchIndex,
        nextMatch,
        prevMatch,
        isSearching,
        totalMatches: matches.length
    };
}
