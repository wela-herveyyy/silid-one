import { USER_ROLE, type UserResult, type UserSelect } from "@/lib/entities/users.type";
import { deleteUser as deleteUserUseCase } from "@/lib/domain/usecases/users/delete_user.usecase";
import {
  getUsers as getUsersUseCase,
  getUsersByRole,
} from "@/lib/domain/usecases/users/get_users.usecase";

export async function getUsers(): Promise<UserSelect[]> {
  return getUsersUseCase();
}

export async function getDevUsers(): Promise<UserSelect[]> {
  return getUsersByRole(USER_ROLE.DEV);
}

export async function deleteUser(input: { id: string }): Promise<UserResult> {
  return deleteUserUseCase(input);
}
