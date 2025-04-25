import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ChatWidget from "./ChatWidget";
import WidgetConfigurator from "./WidgetConfigurator";

const Home = () => {
  const [activeTab, setActiveTab] = useState("demo");

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <header className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            AI-Powered Embeddable Chat Widget
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Fully customizable, context-aware AI chat system for your website
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Documentation
            </Button>
          </div>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Tabs
          defaultValue="demo"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="configure">Configure Widget</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Widget Demo</CardTitle>
                <CardDescription>
                  Experience the chat widget in action. Try asking questions or
                  explore its features.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6 min-h-[600px] bg-slate-50 dark:bg-slate-900 rounded-b-lg">
                <div className="relative w-full max-w-md h-[600px] border border-border rounded-lg overflow-hidden shadow-lg">
                  <ChatWidget />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>
                  Discover what makes our chat widget powerful and versatile.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <h3 className="text-lg font-medium mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configure">
            <Card>
              <CardHeader>
                <CardTitle>Widget Configurator</CardTitle>
                <CardDescription>
                  Customize the appearance, behavior, and functionality of your
                  chat widget.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WidgetConfigurator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-20 py-10 border-t text-center text-muted-foreground">
        <p>© 2023 AI Chat Widget. All rights reserved.</p>
      </footer>
    </div>
  );
};

const features = [
  {
    title: "Context-Aware AI",
    description:
      "Intelligent responses based on your business domain and user queries.",
  },
  {
    title: "Fully Customizable",
    description:
      "Tailor the appearance and behavior to match your brand identity.",
  },
  {
    title: "Knowledge Base Integration",
    description:
      "Connect your existing documentation for more accurate responses.",
  },
  {
    title: "Follow-up Suggestions",
    description: "Smart question prompts to guide users through conversations.",
  },
  {
    title: "Easy Embedding",
    description:
      "Simple integration with any website using our lightweight code snippet.",
  },
  {
    title: "Real-time Communication",
    description: "Instant messaging with typing indicators and read receipts.",
  },
];

export default Home;
