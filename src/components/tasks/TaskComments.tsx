import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { format } from "date-fns";
import { authStore } from "@/stores/AuthStore";

interface Comment {
  id: number;
  task: number;
  author: number;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TaskCommentsProps {
  taskId: number;
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // 코멘트 목록 조회
  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["taskComments", taskId],
    queryFn: async () => {
      try {
        const response = await client.get(`/api/task-comments/?task=${taskId}`);
        return response.data.results || [];
      } catch (error) {
        console.error("Comments API Error:", error);
        return [];
      }
    },
  });

  // 코멘트 작성
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        const response = await client.post("/api/task-comments/", {
          task: taskId,
          content: content,
        });
        return response.data;
      } catch (error: any) {
        console.error("API Error:", error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskComments", taskId] });
      setNewComment("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "코멘트 작성에 실패했습니다.");
    },
  });

  // 코멘트 삭제
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await client.delete(`/api/task-comments/${commentId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskComments", taskId] });
      setDeleteCommentId(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "코멘트 삭제에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const handleDeleteClick = (commentId: number) => {
    setDeleteCommentId(commentId);
  };

  const handleDeleteConfirm = () => {
    if (deleteCommentId) {
      deleteCommentMutation.mutate(deleteCommentId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteCommentId(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        코멘트
      </Typography>

      {/* 코멘트 작성 폼 */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="코멘트를 입력하세요..."
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={createCommentMutation.isPending}
        >
          {createCommentMutation.isPending ? "작성 중..." : "코멘트 작성"}
        </Button>
      </Box>

      {/* 코멘트 목록 */}
      <List>
        {comments?.map((comment: Comment) => (
          <Box key={comment.id}>
            <ListItem
              alignItems="flex-start"
              sx={{ px: 0 }}
              secondaryAction={
                // 작성자 본인이거나 관리자인 경우에만 삭제 버튼 표시
                (comment.author === authStore.user?.id ||
                  authStore.user?.role === "ADMIN") && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteClick(comment.id)}
                  >
                    <Delete />
                  </IconButton>
                )
              }
            >
              <Avatar sx={{ mr: 2 }}>{comment.author_name[0]}</Avatar>
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="subtitle2">
                    {comment.author_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  whiteSpace="pre-wrap"
                >
                  {comment.content}
                </Typography>
              </Box>
            </ListItem>
            <Divider component="li" />
          </Box>
        ))}
      </List>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteCommentId !== null} onClose={handleDeleteCancel}>
        <DialogTitle>코멘트 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말로 이 코멘트를 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>취소</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
