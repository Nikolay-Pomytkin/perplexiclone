"use client";
import { Plus, MessageSquare, Trash2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Thread } from "@/types";

interface AppSidebarProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onClearHistory: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function AppSidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onClearHistory,
  theme,
  onToggleTheme,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="shrink-0">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground">Perplexiclone</span>
              <span className="text-xs text-sidebar-foreground/60">Chat</span>
            </div>
          </div>
          <Button
            onClick={onToggleTheme}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-sidebar-accent text-sidebar-foreground"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>
      
      <div className="shrink-0 p-2 border-b border-sidebar-border">
        <Button 
          onClick={onNewThread} 
          className="w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:px-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground" 
          size="sm"
        >
          <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">New Thread</span>
        </Button>
      </div>

      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            {threads.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                No conversations yet
              </div>
            ) : (
              <SidebarMenu>
                {threads.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <div className="group/item relative flex w-full items-center">
                      <SidebarMenuButton
                        isActive={currentThreadId === thread.id}
                        onClick={() => onSelectThread(thread.id)}
                        className="flex-1"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden truncate">{thread.title}</span>
                      </SidebarMenuButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-6 w-6 opacity-0 transition-opacity group-hover/item:opacity-100 group-data-[collapsible=icon]:hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="shrink-0 p-2 border-t border-sidebar-border">
        <Button
          onClick={onClearHistory}
          variant="outline"
          disabled={threads.length === 0}
          className="w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:px-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-sidebar-border"
          size="sm"
        >
          <Trash2 className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
          <span className="group-data-[collapsible=icon]:hidden">Clear History</span>
        </Button>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

