-- Create an RPC to atomically increment the reply_count of a prospect
CREATE OR REPLACE FUNCTION increment_prospect_reply(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.prospects
  SET 
    reply_count = COALESCE(reply_count, 0) + 1,
    status = 'replied'
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
