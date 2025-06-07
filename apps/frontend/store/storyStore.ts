import { Story } from "@/utils";
import { create } from "zustand";

interface StoryState {
  stories: Story[];
  setStories: (stories: Story[]) => void;
  addNewStory: (newStory: Story) => void;
  addOldStories: (oldStories: Story[]) => void;
  updateStory: (storyId: string, update: Partial<Story>) => void;
  removeStory: (storyId: string) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],

  setStories: (stories) =>
    set({
      stories,
    }),

  addNewStory: (newStory) =>
    set((state) => ({
      stories: [newStory, ...state.stories],
    })),

  addOldStories: (oldStories) =>
    set((state) => ({
      stories: [...state.stories, ...oldStories],
    })),

  updateStory: (storyId, update) =>
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === storyId ? { ...story, ...update } : story,
      ),
    })),

  removeStory: (storyId) =>
    set((state) => ({
      stories: state.stories.filter((story) => story.id !== storyId),
    })),
}));
