import React, { useState } from "react";
import { Check, Copy, Code } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmbedCodeGeneratorProps {
  widgetId?: string;
  widgetConfig?: Record<string, any>;
}

const EmbedCodeGenerator = ({
  widgetId = "chat-widget-123",
  widgetConfig = {},
}: EmbedCodeGeneratorProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  // Generate iframe embed code
  const iframeCode = `<iframe 
  src="https://example.com/widget/${widgetId}" 
  width="350" 
  height="600" 
  frameborder="0"
  allow="microphone"
  style="border: none; position: fixed; bottom: 20px; right: 20px; z-index: 9999;"
></iframe>`;

  // Generate script embed code (more lightweight)
  const scriptCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['ChatWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','chatWidget','https://example.com/widget-loader.js'));
  chatWidget('init', { widgetId: '${widgetId}' });
</script>`;

  // Generate web component code
  const webComponentCode = `<script type="module" src="https://example.com/widget/web-components.js"></script>

<chat-widget 
  widget-id="${widgetId}"
  position="bottom-right"
  theme="light"
></chat-widget>`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <Card className="w-full bg-white border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Embed Your Chat Widget
        </CardTitle>
        <CardDescription>
          Choose your preferred integration method and copy the code to your
          website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="iframe">iFrame</TabsTrigger>
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="webcomponent">Web Component</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                The iframe method is the simplest way to embed the chat widget,
                but may have limitations with cross-domain communication.
              </AlertDescription>
            </Alert>
            <div className="relative">
              <Textarea
                value={iframeCode}
                readOnly
                className="min-h-[120px] font-mono text-sm bg-gray-50"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(iframeCode, "iframe")}
              >
                {copied === "iframe" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="script" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                The script method is lightweight and provides better integration
                with your website's functionality.
              </AlertDescription>
            </Alert>
            <div className="relative">
              <Textarea
                value={scriptCode}
                readOnly
                className="min-h-[150px] font-mono text-sm bg-gray-50"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(scriptCode, "script")}
              >
                {copied === "script" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="webcomponent" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                Web Components provide the most modern and flexible integration,
                with full customization support.
              </AlertDescription>
            </Alert>
            <div className="relative">
              <Textarea
                value={webComponentCode}
                readOnly
                className="min-h-[120px] font-mono text-sm bg-gray-50"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(webComponentCode, "webcomponent")}
              >
                {copied === "webcomponent" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>
            Your widget ID:{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">{widgetId}</code>
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Add this code to your website where you want the chat widget to
          appear. The widget will automatically connect to our servers and load
          your configured settings.
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmbedCodeGenerator;
