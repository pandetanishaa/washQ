import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import PixelButton from "@/components/PixelButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

export const HelpFeedbackDialog = () => {
  const { isAuthenticated, user, submitFeedback } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState<"issue" | "suggestion" | "other">("issue");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);

    // Submit immediately
    try {
      const success = await submitFeedback(subject, message);

      if (success) {
        toast.success("Feedback sent to admin", {
          description: "Thank you for your feedback!",
        });
        setMessage("");
        setSubject("issue");
        setIsOpen(false);
      } else {
        toast.error("Failed to send feedback", {
          description: "Please check your login and try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Error sending feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Only show for authenticated users
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-pixel text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
      </DialogTrigger>

      <DialogContent className="border-2 border-primary">
        <DialogHeader>
          <DialogTitle className="font-pixel text-primary">
            Help & Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="font-pixel text-sm">
              SUBJECT
            </Label>
            <Select value={subject} onValueChange={(value: any) => setSubject(value)}>
              <SelectTrigger id="subject" className="border-2 border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">Issue / Bug</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="font-pixel text-sm">
              MESSAGE
            </Label>
            <Textarea
              id="message"
              placeholder="Describe your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              className="border-2 border-primary resize-none"
              rows={5}
            />
          </div>

          {/* Submit Button */}
          <PixelButton
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full"
          >
            {isSubmitting ? "SENDING..." : "SUBMIT FEEDBACK"}
          </PixelButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};
