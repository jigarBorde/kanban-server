import { Types } from "mongoose";
import { Priority, TaskStatus } from "../types/modelTypes";


export interface IUser {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IStatusHistory {
    status: TaskStatus;
    changedBy: Types.ObjectId;
    changedAt: Date;
    comment?: string;
}

export interface ITask {
    title: string;
    description: string;
    status: TaskStatus;
    ownerId: Types.ObjectId;  // Creator/Owner of the task
    assigneeId?: Types.ObjectId;  // Assigned user
    priority: Priority;
    dueDate?: Date;
    labels: string[];
    statusHistory: IStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}