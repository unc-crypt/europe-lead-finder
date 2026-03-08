import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FolderOpen, Users, Download, Trash2 } from "lucide-react";

const initialLists = [
  { id: "1", name: "German Tech Companies", count: 45, updated: "2 hours ago" },
  { id: "2", name: "French SaaS Leads", count: 28, updated: "1 day ago" },
  { id: "3", name: "Polish Decision Makers", count: 62, updated: "3 days ago" },
  { id: "4", name: "EU FinTech CEOs", count: 15, updated: "1 week ago" },
];

const Lists = () => {
  const [lists, setLists] = useState(initialLists);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const createList = () => {
    if (!newName.trim()) return;
    setLists([...lists, { id: Date.now().toString(), name: newName, count: 0, updated: "Just now" }]);
    setNewName("");
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">My Lists</h1>
            <p className="text-sm text-muted-foreground mt-1">Organize and manage your saved leads</p>
          </div>
          <Button className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New List
          </Button>
        </div>

        {creating && (
          <Card className="mb-6 border-primary/30">
            <CardContent className="p-4 flex gap-3">
              <Input placeholder="List name..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createList()} autoFocus />
              <Button onClick={createList}>Create</Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {lists.map((list) => (
            <Card key={list.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{list.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {list.count} leads
                      </span>
                      <span className="text-xs text-muted-foreground">Updated {list.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lists;
