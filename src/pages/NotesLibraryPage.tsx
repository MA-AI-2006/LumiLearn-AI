import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Tag,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  Calculator,
  BookOpen,
  Filter
} from 'lucide-react';
import { storage } from '../services/storage';
import { NoteDocument } from '../types';

interface NotesLibraryPageProps {
  navigate: (route: string, params?: any) => void;
  initialSearch?: string;
}

export const NotesLibraryPage: React.FC<NotesLibraryPageProps> = ({
  navigate,
  initialSearch = ''
}) => {
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await storage.getNotes();
      setNotes(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this study note?')) {
      await storage.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleDuplicate = async (note: NoteDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: NoteDocument = {
      ...note,
      id: 'note-' + Date.now(),
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await storage.saveNote(duplicated);
    setNotes([duplicated, ...notes]);
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || [])));

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.overview.toLowerCase().includes(search.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesTag = selectedTag === 'all' || n.tags?.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
            Study Library
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#27223B] tracking-tight mt-1">
            My Study Notes
          </h2>
          <p className="text-xs sm:text-sm text-[#514963]">
            {notes.length} comprehensive teaching documents with KaTeX mathematical formulas
          </p>
        </div>

        <button
          onClick={() => navigate('create')}
          className="px-4 py-2.5 rounded-xl bg-[#6654D9] hover:bg-[#5844CA] text-white text-xs font-bold shadow-md shadow-[#6654D9]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EBE6DF] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9D96B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes by title, topic, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F4] border border-[#EBE6DF] text-xs text-[#27223B] placeholder-[#9D96B0] focus:outline-hidden focus:border-[#8B7CF6] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#EBE6DF] bg-[#FAF8F4] text-xs font-medium text-[#27223B] focus:outline-hidden"
          >
            <option value="all">All Topics ({notes.length})</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Grid/List toggles */}
          <div className="flex items-center bg-[#FAF8F4] border border-[#EBE6DF] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-[#6654D9] shadow-xs'
                  : 'text-[#6E6685] hover:text-[#27223B]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#6654D9] shadow-xs'
                  : 'text-[#6E6685] hover:text-[#27223B]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Display */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EBE6DF] p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#8B7CF6]/15 text-[#6654D9] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#27223B]">No study notes found</h3>
          <p className="text-xs text-[#6E6685] max-w-sm mx-auto">
            {search ? 'Try clearing your search query.' : 'Create your first study document to get started.'}
          </p>
          <button
            onClick={() => navigate('create')}
            className="px-4 py-2 rounded-xl bg-[#6654D9] text-white text-xs font-bold"
          >
            Transform Material Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate('note-editor', { id: note.id })}
              className="bg-white rounded-3xl border border-[#EBE6DF] hover:border-[#8B7CF6] p-6 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] bg-[#FAF8FF] px-2 py-0.5 rounded-md border border-[#E2DCF7]">
                    {note.detailLevel} detail
                  </span>
                  <span className="text-[10px] text-[#6E6685] font-medium">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#27223B] group-hover:text-[#6654D9] transition-colors leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-[#514963] line-clamp-3 leading-relaxed">
                  {note.overview}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {note.tags.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F4] text-[#6E6685] border border-[#EBE6DF]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-[#EBE6DF] flex items-center justify-between text-xs text-[#6E6685]">
                <span className="font-semibold text-[#6654D9] flex items-center gap-1 group-hover:underline">
                  <span>Read & Edit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicate(note, e)}
                    className="p-1.5 rounded-lg hover:bg-[#FAF8F4] text-[#6E6685] hover:text-[#27223B]"
                    title="Duplicate note"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(note.id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-[#6E6685] hover:text-rose-600"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-[#EBE6DF] divide-y divide-[#EBE6DF] shadow-xs overflow-hidden">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate('note-editor', { id: note.id })}
              className="p-4 sm:p-5 hover:bg-[#FAF8FF] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-[#6654D9] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-[#27223B] group-hover:text-[#6654D9] truncate">
                    {note.title}
                  </h4>
                  <p className="text-xs text-[#6E6685] truncate mt-0.5">{note.overview}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="hidden sm:inline text-xs font-medium text-[#6E6685]">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicate(note, e)}
                    className="p-1.5 rounded-lg hover:bg-white text-[#6E6685]"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(note.id, e)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-[#6E6685] hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
