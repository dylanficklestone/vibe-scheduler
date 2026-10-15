import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  Mail,
  Send,
  Bell,
  CheckCircle,
  HelpCircle,
  Plus,
  Filter,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { ForumPost } from '../types';

interface CommunityForumProps {
  posts: ForumPost[];
  onAddPost: (post: ForumPost) => void;
  onUpvotePost: (id: string) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  posts,
  onAddPost,
  onUpvotePost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumPost['category']>('Last-Minute Cover');
  const [authorName, setAuthorName] = useState('');
  const [storeName, setStoreName] = useState('');

  // Contact support form
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  // Notification simulator
  const [simulatedBroadcastSuccess, setSimulatedBroadcastSuccess] = useState<string | null>(null);

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: ForumPost = {
      id: `forum_${Date.now()}`,
      author: authorName.trim() || 'Store Operator',
      storeName: storeName.trim() || 'Independent Store (1 Outlet)',
      storeType: 'Retail & Hospitality',
      title: title.trim(),
      content: content.trim(),
      category,
      upvotes: 1,
      repliesCount: 0,
      timeAgo: 'Just now',
    };

    onAddPost(newPost);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail || !supportMessage) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportEmail('');
      setSupportMessage('');
    }, 4000);
  };

  const handleSimulateRosterEmail = () => {
    setSimulatedBroadcastSuccess('Roster notifications dispatched via Email & SMS to all 5 in-house staff members!');
    setTimeout(() => setSimulatedBroadcastSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                C2C Community & Store Manager Hub
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Connect with fellow 1-store retail and café operators. Share roster templates, exchange advice on managing last-minute callouts, and simulate staff notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Peer Discussions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {['all', 'Last-Minute Cover', 'Roster Advice', 'Wage Regulations', 'Agency Tips'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {post.category} · {post.timeAgo}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {post.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onUpvotePost(post.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono tabular-nums">{post.upvotes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {post.content}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{post.author}</span>
                    <span>·</span>
                    <span>{post.storeName} ({post.storeType})</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-600 font-mono">
                    <MessageSquare className="w-3 h-3" />
                    <span>{post.repliesCount} replies</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Channels & Customer Relations (Email & SMS notifications) */}
        <div className="space-y-4">
          {/* Notification Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Staff Broadcast Channels
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Publishing the roster triggers automated Email digests and SMS push alerts directly to staff smartphones.
            </p>

            <button
              onClick={handleSimulateRosterEmail}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulate Roster Push Broadcast</span>
            </button>

            {simulatedBroadcastSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{simulatedBroadcastSuccess}</span>
              </div>
            )}
          </div>

          {/* Contact Us Via Email (Canvas Customer Relationship) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Contact Support via Email
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have questions regarding wage compliances, agency APIs, or shift templates? Reach our single-store operations desk.
            </p>

            {supportSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Message received! Our team responds within 2 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="space-y-2.5">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Your store email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we assist your outlet?"
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Start Discussion Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              New Community Discussion
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask advice, share scheduling strategies, or discuss casual rates.
            </p>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Tan"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Business</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily Grind Coffee"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ForumPost['category'])}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="Last-Minute Cover">Last-Minute Cover</option>
                  <option value="Roster Advice">Roster Advice</option>
                  <option value="Wage Regulations">Wage Regulations</option>
                  <option value="Agency Tips">Agency Tips</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question / Title</label>
                <input
                  type="text"
                  required
                  placeholder="What is your question or tip?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context on your store setup, problem, or solution..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
