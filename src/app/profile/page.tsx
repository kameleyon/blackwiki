"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    expertise: "",
    interests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local state with the returned user data
      setFormData({
        name: data.user.name || '',
        bio: data.user.bio || '',
        location: data.user.location || '',
        website: data.user.website || '',
        twitter: data.user.twitter || '',
        expertise: Array.isArray(data.user.expertise) 
          ? data.user.expertise.join(', ')
          : data.user.expertise || '',
        interests: Array.isArray(data.user.interests)
          ? data.user.interests.join(', ')
          : data.user.interests || '',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // TODO: Add error notification
    }
  };

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/profile/update');
          const data = await response.json();

          if (response.ok && data.user) {
            setFormData({
              name: data.user.name || '',
              bio: data.user.bio || '',
              location: data.user.location || '',
              website: data.user.website || '',
              twitter: data.user.twitter || '',
              expertise: Array.isArray(data.user.expertise)
                ? data.user.expertise.join(', ')
                : data.user.expertise || '',
              interests: Array.isArray(data.user.interests)
                ? data.user.interests.join(', ')
                : data.user.interests || '',
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/5 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container  mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-6">
              <div className="relative group">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-background/70 border-white/20 border-1 flex items-center justify-center">
                    <span className="text-2xl">{session?.user?.name?.[0]}</span>
                  </div>
                )}
                <label 
                  htmlFor="profile-image"
                  className="absolute inset-0 flex items-center  justify-center bg-black/50 rounded-full 
                           opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <span className="text-white text-sm">Change Photo</span>
                </label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                      const response = await fetch("/api/profile/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.error || "Failed to upload image");
                      }

                      // Refresh the session to update the image
                      window.location.reload();
                    } catch (error) {
                      console.error("Error uploading image:", error);
                      // TODO: Add error notification
                    }
                  }}
                />
              </div>
            <div>
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <p className="text-sm mt-1 bg-primary/10 text-primary px-2 py-1 rounded-full inline-block">
                {session?.user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20 h-32"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Areas of Expertise</label>
              <input
                type="text"
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., African History, Black Literature, Civil Rights"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topics of Interest</label>
              <input
                type="text"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="w-full px-4 py-2 bg-secondary/10 rounded-lg focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Music, Art, Politics"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">
                No bio provided yet.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">Not specified</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Website: Not specified</p>
                <p>Twitter: Not specified</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Expertise</h3>
              <p className="text-muted-foreground">No areas of expertise specified</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Interests</h3>
              <p className="text-muted-foreground">No interests specified</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
