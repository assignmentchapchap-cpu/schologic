'use client';

import { Github, Twitter, Linkedin, GraduationCap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-white py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-xl mb-4">
                            <GraduationCap className="w-8 h-8 text-indigo-500" />
                            Schologic LMS
                        </div>
                        <p className="text-gray-400 mb-6">
                            Empowering educators with AI-driven insights and automated grading. Built for the future of learning.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
                            <li><a href="#demo" className="hover:text-blue-400 transition-colors">Request Demo</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Schologic LMS. All rights reserved.
                    </p><div className="flex gap-6">
                        <Github className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                        <Twitter className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                        <Linkedin className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                    </div>
                </div>
            </div >
        </footer >
    );
}
