import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Clock, Calendar, User, Tag, ArrowLeft, 
  Share2, Check, Sparkles, RefreshCw, AlertCircle, ChevronRight, Filter,
  MessageSquare, FileText, ArrowRight
} from 'lucide-react';
import { BlogPost, BlogCategory } from '../types/blog.types';
import { getPublishedBlogPosts, getBlogPostBySlug } from '../lib/blog.service';
import { SITE } from '../lib/site-config';

interface BlogViewProps {
  initialSlug?: string | null;
  onOpenAiWithContext?: (context: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ initialSlug, onOpenAiWithContext }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'JEE', 'NEET'];

  // Load published blog posts from Cloud Firestore
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await getPublishedBlogPosts();
      setPosts(fetchedPosts);

      // Check if initial slug is provided or present in URL
      const targetSlug = initialSlug || getSlugFromUrl();
      if (targetSlug) {
        const matchingPost = fetchedPosts.find(
          (p) => p.slug === targetSlug || p.id === targetSlug
        );
        if (matchingPost) {
          setActivePost(matchingPost);
        } else {
          // Fetch directly from Firestore service if not in list
          const fetchedSingle = await getBlogPostBySlug(targetSlug);
          if (fetchedSingle) {
            setActivePost(fetchedSingle);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading blog posts from Firestore:', err);
      setError('Unable to load blog articles from Firestore. Please verify internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [initialSlug]);

  // Extract slug from URL pathname (/blog/:slug)
  const getSlugFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '').trim();
      return slug ? decodeURIComponent(slug) : null;
    }
    return null;
  };

  // Synchronize SEO tags and JSON-LD structured data
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const baseUrl = SITE.url;
    let titleText = 'VStudyHub Blog - JEE & NEET Preparation Tips, Strategies & Concepts';
    let descriptionText = 'Explore expert JEE & NEET preparation tips, chapter breakdowns, formulas, and strategies on VStudyHub.';
    let canonicalUrl = `${baseUrl}/blog`;

    if (activePost) {
      titleText = `${activePost.title} | VStudyHub JEE & NEET Prep`;
      descriptionText = activePost.excerpt || activePost.content.substring(0, 160);
      canonicalUrl = `${baseUrl}/blog/${activePost.slug || activePost.id}`;
    }

    // Update document title
    document.title = titleText;

    // Helper to update or create meta tag
    const setMetaTag = (selector: string, attribute: string, value: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, value);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update link tag
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // Meta Description & Open Graph
    setMetaTag('meta[name="description"]', 'name', 'description', descriptionText);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', titleText);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', descriptionText);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', activePost ? 'article' : 'website');

    // Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', titleText);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', descriptionText);
    setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);

    // JSON-LD Structured Data
    let jsonLdScript = document.getElementById('vstudyhub-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'vstudyhub-jsonld';
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }

    if (activePost) {
      const pubDate = formatDateIso(activePost.publishedAt || activePost.createdAt);
      const jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': activePost.title,
        'description': descriptionText,
        'datePublished': pubDate,
        'dateModified': pubDate,
        'articleSection': activePost.category || 'Physics',
        'image': [`${baseUrl}/og-image.png`],
        'author': {
          '@type': 'Organization',
          'name': activePost.author || 'VStudyHub',
          'url': baseUrl
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'VStudyHub',
          'url': baseUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': `${baseUrl}/logo.png`
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        }
      };
      jsonLdScript.textContent = JSON.stringify(jsonLdData);
    } else {
      const jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': 'VStudyHub Blog',
        'description': descriptionText,
        'url': canonicalUrl,
        'publisher': {
          '@type': 'Organization',
          'name': 'VStudyHub',
          'url': baseUrl,
          'logo': {
            '@type': 'ImageObject',
            'url': `${baseUrl}/logo.png`
          }
        }
      };
      jsonLdScript.textContent = JSON.stringify(jsonLdData);
    }

  }, [activePost]);

  // Handle post selection and URL pushState
  const handleSelectPost = (post: BlogPost) => {
    setActivePost(post);
    if (typeof window !== 'undefined') {
      const postSlug = post.slug || post.id;
      window.history.pushState({}, '', `/blog/${postSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToListing = () => {
    setActivePost(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/blog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Date formatting helpers
  const formatDate = (val: any) => {
    if (!val) return 'Recently';
    try {
      let dateObj: Date;
      if (typeof val.toDate === 'function') {
        dateObj = val.toDate();
      } else if (val.seconds) {
        dateObj = new Date(val.seconds * 1000);
      } else {
        dateObj = new Date(val);
      }
      if (isNaN(dateObj.getTime())) return 'Recently';
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  const formatDateIso = (val: any) => {
    if (!val) return new Date().toISOString();
    try {
      if (typeof val.toDate === 'function') return val.toDate().toISOString();
      if (val.seconds) return new Date(val.seconds * 1000).toISOString();
      const d = new Date(val);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  };

  // Category badge color mapping
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Physics':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Chemistry':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Mathematics':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Biology':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'JEE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'NEET':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  // Category & Search filter logic
  const filteredPosts = posts.filter((post) => {
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'JEE') {
      matchesCategory = 
        post.category === 'JEE' || 
        post.tags.some(t => t.toLowerCase().includes('jee')) ||
        post.title.toLowerCase().includes('jee') ||
        post.excerpt.toLowerCase().includes('jee');
    } else if (selectedCategory === 'NEET') {
      matchesCategory = 
        post.category === 'NEET' || 
        post.tags.some(t => t.toLowerCase().includes('neet')) ||
        post.title.toLowerCase().includes('neet') ||
        post.excerpt.toLowerCase().includes('neet');
    } else {
      matchesCategory = 
        post.category === selectedCategory ||
        post.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()) ||
        post.title.toLowerCase().includes(selectedCategory.toLowerCase());
    }

    const queryLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !queryLower || 
      post.title.toLowerCase().includes(queryLower) ||
      post.excerpt.toLowerCase().includes(queryLower) ||
      post.content.toLowerCase().includes(queryLower) ||
      post.tags.some(tag => tag.toLowerCase().includes(queryLower));

    return matchesCategory && matchesSearch;
  });

  // Related articles (matching category/tags excluding activePost)
  const relatedPosts = activePost
    ? posts
        .filter((p) => p.id !== activePost.id)
        .slice(0, 3)
    : [];

  const handleShareArticle = (post: BlogPost) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom text renderer for formatting content with Markdown-style support
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      const trimmed = para.trim();
      
      // H1 Header
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3">
            {trimmed.substring(2)}
          </h1>
        );
      }
      // H2 Header
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            {trimmed.substring(3)}
          </h2>
        );
      }
      // H3 Header
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-4 mb-2">
            {trimmed.substring(4)}
          </h3>
        );
      }
      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').map((item) => item.replace(/^[-*]\s+/, ''));
        return (
          <ul key={idx} className="list-disc list-inside space-y-1.5 my-3 pl-2 text-slate-700 dark:text-slate-300">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }

      // Paragraph with bolding support
      return (
        <p key={idx} className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-line my-3">
          {trimmed}
        </p>
      );
    });
  };

  // RENDER: Full Article Detail View
  if (activePost) {
    return (
      <div className="py-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Navigation back */}
        <button
          onClick={handleBackToListing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {/* Header & Article Card */}
        <article className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryBadgeClass(activePost.category)}`}>
              {activePost.category}
            </span>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(activePost.publishedAt || activePost.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {activePost.readingTime || 2} min read
              </span>
              <button
                onClick={() => handleShareArticle(activePost)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Share article link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            {activePost.title}
          </h1>

          <div className="flex items-center gap-3 pt-2 pb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {activePost.author ? activePost.author.charAt(0).toUpperCase() : 'V'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activePost.author || 'VStudyHub Expert Faculty'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JEE & NEET Exam Mentor • VStudyHub Academic Content
              </p>
            </div>
          </div>

          {/* Excerpt Summary Box */}
          {activePost.excerpt && (
            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-sm leading-relaxed font-medium">
              <strong className="font-bold text-blue-700 dark:text-blue-300 block mb-1">Article Summary:</strong>
              {activePost.excerpt}
            </div>
          )}

          {/* Formatted Article Body */}
          <div className="pt-2">
            {renderFormattedContent(activePost.content)}
          </div>

          {/* Tags */}
          {activePost.tags && activePost.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Tags:
              </span>
              {activePost.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* AI Doubt Assistant Callout */}
          {onOpenAiWithContext && (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <h4 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Have Questions About This Topic?
                </h4>
                <p className="text-xs text-blue-200">
                  Ask our IIT-JEE Rank 1 & AIIMS NEET AI Tutor for instant step-by-step doubt resolution.
                </p>
              </div>
              <button
                onClick={() => onOpenAiWithContext(`Topic: ${activePost.title}\n${activePost.excerpt}`)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-md flex-shrink-0 cursor-pointer"
              >
                Ask AI Tutor
              </button>
            </div>
          )}
        </article>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleSelectPost(rel)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(rel.category)}`}>
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {rel.excerpt || rel.content.substring(0, 80)}
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Read Now</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // RENDER: Main Blog Listing View
  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-blue-300" />
            <span>VStudyHub Blog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            VStudyHub Blog
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
            JEE & NEET preparation tips, concepts, strategies, formulas, and exam updates
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Category Filters: All | Physics | Chemistry | Mathematics | Biology | JEE | NEET */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchPosts}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={fetchPosts} className="ml-auto font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 p-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No Published Articles Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' 
              ? 'No articles match your current search query or category filter.' 
              : 'Blog articles published in Cloud Firestore (collection "blogPosts" with published: true) will appear here.'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* Blog Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handleSelectPost(post)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(post.category)}`}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime || 2} min read
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.excerpt || post.content.substring(0, 140) + '...'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {post.author || 'VStudyHub'}
                  </span>
                </div>
                
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read More <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
