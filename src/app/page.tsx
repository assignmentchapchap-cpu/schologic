import Link from 'next/link';
import { GraduationCap, School } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Instructor Portal - Left Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-900 text-white border-b md:border-b-0 md:border-r border-slate-700">
        <div className="max-w-md text-center space-y-6">
          <School className="w-20 h-20 mx-auto text-blue-400" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Instructor Portal
          </h1>
          <p className="text-slate-300 text-lg">
            Create a classroom, invite students, and analyze their submissions for AI-generated content with sentence-level precision.
          </p>
          <div className="pt-8">
            <Link
              href="/login?role=instructor"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Create Class & Analyze
            </Link>
          </div>
          <div className="mt-12 text-sm text-slate-400 border border-slate-700 p-4 rounded bg-slate-800/50 text-left">
            <strong className="block text-blue-300 mb-2">How it works:</strong>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Sign in (Guest available)</li>
              <li>Create a Class to get a Code</li>
              <li>Share Code with Students</li>
              <li>View Reports instantly</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Student Portal - Right Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-slate-900">
        <div className="max-w-md text-center space-y-6">
          <GraduationCap className="w-20 h-20 mx-auto text-emerald-600" />
          <h1 className="text-4xl font-bold text-slate-900">
            Student Portal
          </h1>
          <p className="text-slate-600 text-lg">
            Join your class, upload your assignment, and get instant feedback on your originality score.
          </p>
          <div className="pt-8">
            <Link
              href="/student/login"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Join Class & Submit
            </Link>
          </div>
          <div className="mt-12 text-sm text-slate-500 border border-slate-200 p-4 rounded bg-slate-50 text-left">
            <strong className="block text-emerald-600 mb-2">Student Steps:</strong>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Get 6-digit code from teacher</li>
              <li>Enter Code & Name</li>
              <li>Upload Docx or Paste Text</li>
              <li>See your AI Result</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
