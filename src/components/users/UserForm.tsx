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
  username: string;
  password?: string;
  email: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department: number;
  rank: string;
  role: string;
}

const schema = yup.object().shape({
  username: yup.string().required("사용자명은 필수입니다"),
  email: yup
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .required("이메일은 필수입니다"),
  employee_id: yup.string().required("사번은 필수입니다"),
  first_name: yup.string().required("이름은 필수입니다"),
  last_name: yup.string().required("성은 필수입니다"),
  department: yup.number().required("서는 필수입니다"),
  rank: yup.string().required("직급은 필수입니다"),
  role: yup.string().required("역할은 필수입니다"),
  password: yup.string().when("$isNew", {
    is: true,
    then: (schema) => schema.required("비밀번호는 필수입니다"),
    otherwise: (schema) => schema.optional(),
  }),
});

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormInputs) => void;
  initialData?: FormInputs;
}

export default function UserForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    context: { isNew: !initialData },
    defaultValues: initialData || {
      username: "",
      email: "",
      employee_id: "",
      first_name: "",
      last_name: "",
      department: undefined,
      rank: "",
      role: "EMPLOYEE",
    },
  });

  // 부서 목록 조회
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await client.get("/api/departments/");
      return response.data;
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        initialData || {
          username: "",
          email: "",
          employee_id: "",
          first_name: "",
          last_name: "",
          department: undefined,
          rank: "",
          role: "EMPLOYEE",
        }
      );
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: FormInputs) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? "직원 정보 수정" : "새 직원 등록"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                {...register("username")}
                label="사용자명"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message as string}
              />
            </Grid>
            {!initialData && (
              <Grid item xs={12} md={6}>
                <TextField
                  {...register("password")}
                  label="비밀번호"
                  type="password"
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message as string}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                {...register("email")}
                label="이메일"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
            </Grid>
            {initialData && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="사번"
                  value={initialData.employee_id}
                  fullWidth
                  disabled
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                {...register("last_name")}
                label="성"
                fullWidth
                error={!!errors.last_name}
                helperText={errors.last_name?.message as string}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                {...register("first_name")}
                label="이름"
                fullWidth
                error={!!errors.first_name}
                helperText={errors.first_name?.message as string}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>부서</InputLabel>
                <Select
                  {...register("department")}
                  label="부서"
                  defaultValue=""
                >
                  <MenuItem value="" disabled>
                    부서를 선택하세요
                  </MenuItem>
                  {departments?.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <FormHelperText>
                    {errors.department.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.rank}>
                <InputLabel>직급</InputLabel>
                <Select {...register("rank")} label="직급" defaultValue="">
                  <MenuItem value="" disabled>
                    직급을 선택하세요
                  </MenuItem>
                  <MenuItem value="STAFF">사원</MenuItem>
                  <MenuItem value="SENIOR">주임</MenuItem>
                  <MenuItem value="ASSISTANT_MANAGER">대리</MenuItem>
                  <MenuItem value="MANAGER">팀장</MenuItem>
                  <MenuItem value="DEPUTY_GENERAL_MANAGER">차장</MenuItem>
                  <MenuItem value="GENERAL_MANAGER">본부장</MenuItem>
                  <MenuItem value="DIRECTOR">이사</MenuItem>
                </Select>
                {errors.rank && (
                  <FormHelperText>
                    {errors.rank.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>역할</InputLabel>
                <Select
                  {...register("role")}
                  label="역할"
                  defaultValue="EMPLOYEE"
                >
                  <MenuItem value="EMPLOYEE">일반 직원</MenuItem>
                  <MenuItem value="MANAGER">매니저</MenuItem>
                  <MenuItem value="ADMIN">관리자</MenuItem>
                </Select>
                {errors.role && (
                  <FormHelperText>
                    {errors.role.message as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
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
