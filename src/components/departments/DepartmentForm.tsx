import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

interface FormInputs {
  name: string;
  code?: string;
  parent?: number | null;
}

const schema = yup.object().shape({
  name: yup.string().required("부서/팀 이름은 필수입니다"),
});

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormInputs) => void;
  initialData?: any;
  isTeam?: boolean;
}

export default function DepartmentForm({ 
  open, 
  onClose, 
  onSubmit, 
  initialData,
  isTeam = false 
}: DepartmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      name: '',
      parent: null,
    },
  });

  // 본부 목록 조회 (팀 생성/수정 시에만 필요)
  const { data: headquarters } = useQuery({
    queryKey: ["headquarters"],
    queryFn: async () => {
      const response = await client.get("/api/departments/", {
        params: { parent_isnull: true }
      });
      return response.data;
    },
    enabled: isTeam,
  });

  useEffect(() => {
    if (open) {
      reset(initialData || {
        name: '',
        parent: null,
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: FormInputs) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 
          (isTeam ? "팀 정보 수정" : "본부 정보 수정") : 
          (isTeam ? "새 팀 등록" : "새 본부 등록")
        }
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                {...register("name")}
                label={isTeam ? "팀 이름" : "본부 이름"}
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            {initialData && (
              <Grid item xs={12}>
                <TextField
                  label="부서 코드"
                  value={initialData.code}
                  fullWidth
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            )}
            {isTeam && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>소속 본부</InputLabel>
                  <Select
                    {...register("parent")}
                    label="소속 본부"
                    defaultValue={initialData?.parent || ""}
                  >
                    {headquarters?.map((hq: any) => (
                      <MenuItem key={hq.id} value={hq.id}>
                        {hq.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button type="submit" variant="contained">
            {initialData ? "수정" : "등록"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 