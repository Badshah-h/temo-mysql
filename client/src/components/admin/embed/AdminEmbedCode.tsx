import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import AdminLayout from "../AdminLayout";

const AdminEmbedCode: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const scriptCode = `<script>
  (function(w, d) {
    var s = d.createElement('script');
    s.src = 'https://cdn.example.com/chat-widget.js';
    s.async = true;
    s.defer = true;
    s.id = 'chat-widget-script';
    s.setAttribute('data-client-id', 'YOUR_CLIENT_ID');
    d.getElementsByTagName('head')[0].appendChild(s);
  })(window, document);
</script>`;

  const iframeCode = `<iframe
  src="https://chat.example.com/widget?clientId=YOUR_CLIENT_ID"
  width="100%"
  height="600px"
  frameborder="0"
  allow="microphone"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`;

  const npmCode = `npm install @example/chat-widget

// Then in your React component
import { ChatWidget } from '@example/chat-widget';

function App() {
  return (
    <ChatWidget 
      clientId="YOUR_CLIENT_ID"
      theme="light"
      position="bottom-right"
    />
  );
}`;

  return (
    <AdminLayout title="Embed Code">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Get Your Embed Code</h2>
          <p className="text-slate-500">
            Choose the integration method that works best for your website.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="script">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="script">Script Tag</TabsTrigger>
                <TabsTrigger value="iframe">iFrame</TabsTrigger>
                <TabsTrigger value="npm">NPM Package</TabsTrigger>
              </TabsList>

              <TabsContent value="script" className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">JavaScript Snippet</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(scriptCode, "script")}
                    >
                      {copied === "script" ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" /> Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                    {scriptCode}
                  </pre>
                </div>
                <p className="text-sm text-slate-500">
                  Add this script to the <code>&lt;head&gt;</code> section of
                  your website. Replace <code>YOUR_CLIENT_ID</code> with your
                  actual client ID.
                </p>
              </TabsContent>

              <TabsContent value="iframe" className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">iFrame Embed</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(iframeCode, "iframe")}
                    >
                      {copied === "iframe" ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" /> Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                    {iframeCode}
                  </pre>
                </div>
                <p className="text-sm text-slate-500">
                  Use this iframe to embed the chat widget directly in your
                  page. Customize the width, height, and styling as needed.
                </p>
              </TabsContent>

              <TabsContent value="npm" className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">NPM Installation</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(npmCode, "npm")}
                    >
                      {copied === "npm" ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" /> Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                    {npmCode}
                  </pre>
                </div>
                <p className="text-sm text-slate-500">
                  For React applications, install our NPM package and import the
                  ChatWidget component. This provides the most customization
                  options.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">
            Need help with integration?
          </h3>
          <p className="text-sm text-blue-700">
            Check out our{" "}
            <a href="#" className="underline">
              integration guide
            </a>{" "}
            or{" "}
            <a href="#" className="underline">
              contact support
            </a>{" "}
            for assistance with custom implementations.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmbedCode;
