import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/prismaClient";
import { Role } from "@prisma/client";
import { ApiError } from "@/middleware/errorHandler";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
      phone: input.phone,
      ...(input.role === "COACH" ? { coach: { create: {} } } : {}),
      ...(input.role === "PARENT" ? { parent: { create: {} } } : {}),
    },
  });
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"] }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
