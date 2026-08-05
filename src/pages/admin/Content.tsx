import { useState, useEffect } from "react";
import { Edit3, Save, Check } from "lucide-react";
import { useContent } from "../../context/ContentContext";

export function AdminContent() {
  const { content, updateContent, isLoading } = useContent();
  const [formData, setFormData] = useState(content.hero);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFormData(content.hero);
    }
  }, [content, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const success = await updateContent({
      ...content,
      hero: formData
    });
    
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save content. Make sure the development server is running.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-evolw-gray-500">Loading content editor...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Content Editor</h2>
        <p className="text-evolw-gray-500">Edit the text on your live website. Changes sync to the database immediately.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-evolw-slate rounded-3xl border border-evolw-gray-200 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-evolw-gray-200 dark:border-white/5 flex justify-between items-center bg-evolw-gray-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">Homepage Hero Section</h3>
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${
              saveSuccess 
                ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" 
                : "bg-evolw-accent hover:bg-blue-600 shadow-evolw-accent/20"
            }`}
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Top Badge Text</label>
              <input 
                type="text" 
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all"
              />
              <p className="text-xs text-evolw-gray-500">The small pill badge above the main title.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Title (Line 1)</label>
                <input 
                  type="text" 
                  name="titleLine1"
                  value={formData.titleLine1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all font-bold text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Title (Line 2)</label>
                <input 
                  type="text" 
                  name="titleLine2"
                  value={formData.titleLine2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all font-bold text-lg"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Title Highlight (Blue Text)</label>
              <input 
                type="text" 
                name="titleHighlight"
                value={formData.titleHighlight}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-blue-50 dark:bg-blue-900/10 text-evolw-accent focus:outline-none focus:ring-2 focus:ring-evolw-accent border-blue-200 dark:border-blue-900/30 transition-all font-bold text-lg"
              />
              <p className="text-xs text-evolw-gray-500">The final word of the title that receives the blue accent styling.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-evolw-gray-700 dark:text-gray-300">Subtitle Paragraph</label>
              <textarea 
                name="subtitle"
                rows={4}
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border bg-evolw-gray-50 dark:bg-evolw-black focus:outline-none focus:ring-2 focus:ring-evolw-accent border-evolw-gray-200 dark:border-white/10 transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
