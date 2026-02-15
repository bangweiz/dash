/** @jsxImportSource hono/jsx */
import type { FC } from 'hono/jsx'
import { Docset } from '../services/docsetService'

interface DashboardProps {
  docsets: Docset[];
}

// Helper to allow string onclick
declare module 'hono/jsx' {
  namespace JSX {
    interface HTMLAttributes {
      onclick?: string;
    }
  }
}

export const Dashboard: FC<DashboardProps> = (props: DashboardProps) => {
  const { docsets } = props;

  const AVAILABLE_DOCSETS = [
    {
      id: "go",
      name: "Go",
      url: "http://tokyo.kapeli.com/feeds/Go.tgz",
      icon: "go",
    },
    {
      id: "java",
      name: "Java SE 11",
      url: "http://tokyo.kapeli.com/feeds/Java_SE11.tgz",
      icon: "java",
    },
    {
      id: "rust",
      name: "Rust",
      url: "http://tokyo.kapeli.com/feeds/Rust.tgz",
      icon: "rust",
    },
  ];

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Docset Manager</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          async function deleteDocset(id) {
            if(!confirm('Are you sure you want to delete ' + id + '?')) return;
            try {
              const res = await fetch('/api/docsets/' + id, { method: 'DELETE' });
              if(res.ok) {
                window.location.reload();
              } else {
                alert('Failed to delete');
              }
            } catch(e) {
              alert(e);
            }
          }

          async function installDocset(url, name) {
            const btn = document.getElementById('install-' + name);
            const originalText = btn.innerText;
            btn.innerText = 'Installing...';
            btn.disabled = true;

            try {
              const res = await fetch('/api/docsets/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name })
              });
              if(res.ok) {
                window.location.reload();
              } else {
                const json = await res.json();
                alert('Failed: ' + (json.error || 'Unknown error'));
              }
            } catch(e) {
              alert(e);
            } finally {
              if(btn) {
                  btn.innerText = originalText;
                  btn.disabled = false;
              }
            }
          }

          async function installCustom(e) {
            e.preventDefault();
            const url = document.getElementById('custom-url').value;
            const name = document.getElementById('custom-name').value;
            if(!url || !name) return;

            const btn = document.getElementById('custom-btn');
            const originalText = btn.innerText;
            btn.innerText = 'Installing...';
            btn.disabled = true;

            try {
               const res = await fetch('/api/docsets/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name })
              });
              if(res.ok) {
                window.location.reload();
              } else {
                 const json = await res.json();
                 alert('Failed: ' + (json.error || 'Unknown error'));
              }
            } catch(e) {
                alert(e);
            } finally {
              btn.innerText = originalText;
              btn.disabled = false;
            }
          }
        ` }} />
      </head>
      <body class="bg-slate-50 text-slate-900 font-sans min-h-screen p-8">
        <div class="max-w-4xl mx-auto">
          <header class="mb-8 border-b border-slate-200 pb-4 flex justify-between items-center">
            <h1 class="text-3xl font-bold text-slate-800">Docset Manager</h1>
            <a href="/" class="text-blue-600 hover:underline">Back to App</a>
          </header>

          <main class="space-y-8">
            {/* Installed Docsets */}
            <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 class="text-xl font-semibold mb-4 text-slate-700">Installed Docsets</h2>
              {docsets.length === 0 ? (
                <p class="text-slate-500 italic">No docsets installed.</p>
              ) : (
                <ul class="divide-y divide-slate-100">
                  {docsets.map(d => (
                    <li class="py-3 flex justify-between items-center">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-slate-500">
                          {d.icon === 'book' ? d.name.substring(0, 1).toUpperCase() : (
                             // Simple icon placeholder logic
                             d.icon === 'go' ? 'Go' : d.icon === 'java' ? 'Ja' : d.icon === 'rust' ? 'Ru' : '?'
                          )}
                        </div>
                        <span class="font-medium">{d.name}</span>
                        <span class="text-xs text-slate-400 font-mono">{d.id}</span>
                      </div>
                      <button
                        onclick={`deleteDocset('${d.id}')`}
                        class="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Install New */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Popular Feeds */}
                <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 class="text-xl font-semibold mb-4 text-slate-700">Popular Docsets</h2>
                  <ul class="space-y-3">
                    {AVAILABLE_DOCSETS.map(d => (
                      <li class="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                         <span class="font-medium">{d.name}</span>
                         <button
                           id={`install-${d.name}`}
                           onclick={`installDocset('${d.url}', '${d.name}')`}
                           class="bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                         >
                           Install
                         </button>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Custom Install */}
                <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 class="text-xl font-semibold mb-4 text-slate-700">Install from URL</h2>
                  <form onsubmit="installCustom(event)" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
                      <input type="text" id="custom-name" required placeholder="e.g. Node.js" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">URL (.tgz/.zip)</label>
                      <input type="url" id="custom-url" required placeholder="http://example.com/docs.tgz" class="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" id="custom-btn" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium">
                      Install
                    </button>
                  </form>
                </section>
            </div>

          </main>
        </div>
      </body>
    </html>
  )
}
