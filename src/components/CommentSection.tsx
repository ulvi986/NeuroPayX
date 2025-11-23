import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "./ui/card";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (comment: string) => Promise<any>;
}

export const CommentSection = ({ comments, onAddComment }: CommentSectionProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Comments</h3>
      
      {user && (
        <Card className="p-4">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !newComment.trim()}
          >
            Post Comment
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>
                  {comment.profiles?.first_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">
                  {comment.profiles?.first_name} {comment.profiles?.last_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
                <p className="mt-2">{comment.comment}</p>
              </div>
            </div>
          </Card>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};
