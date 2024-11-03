import { Types } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';
import { Request, Response, NextFunction } from 'express';
import { Priority, TaskStatus } from '../../types/modelTypes';
import { Task } from '../../models/taskModel';
import { User } from '../../models/userModel';

interface CreateTaskBody {
    title: string;
    description: string;
    priority: Priority;
    assigneeId: string;
    labels: string[];
    dueDate: string;
    status: TaskStatus;
}

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        googleId: string;
    };
}

export const createTask = async (
    req: AuthenticatedRequest & { body: CreateTaskBody },
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check if user exists first
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const {
            title,
            description,
            priority,
            assigneeId,
            labels,
            dueDate,
            status = TaskStatus.OPEN
        } = req.body;

        // Input validation
        if (!title?.trim()) {
            return next(new ErrorHandler(400, "Title is required"));
        }

        if (!description?.trim()) {
            return next(new ErrorHandler(400, "Description is required"));
        }


        if (!Object.values(Priority).includes(priority)) {
            return next(new ErrorHandler(400, "Invalid priority value"));
        }
        console.log('status', status);

        if (!Object.values(TaskStatus).includes(status)) {
            return next(new ErrorHandler(400, "Invalid status value"));
        }

        // Validate assigneeId is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(assigneeId)) {
            return next(new ErrorHandler(400, "Invalid assignee ID"));
        }

        // Validate dueDate is a valid date
        const parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
            return next(new ErrorHandler(400, "Invalid due date"));
        }

        // Validate labels array
        if (!Array.isArray(labels)) {
            return next(new ErrorHandler(400, "Labels must be an array"));
        }

        // Store user ID in a variable after authentication check
        const userId = req.user.userId;

        // Create the task
        const task = new Task({
            title: title.trim(),
            description: description.trim(),
            status,
            ownerId: userId,
            assigneeId: new Types.ObjectId(assigneeId),
            priority,
            dueDate: parsedDueDate,
            labels: labels.map(label => label.trim()).filter(Boolean),
            statusHistory: [{
                status,
                changedBy: userId,
                changedAt: new Date(),
                comment: 'Task created'
            }]
        });

        await task.save();

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });

    } catch (error) {
        console.error('Error creating task:', error);
        return next(new ErrorHandler(500, "Internal server error"));
    }
};


export const getAllTasks = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check if user exists first
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const tasks = await Task.find().populate('assigneeId', 'firstName lastName').lean();

        if (!tasks) {
            return next(new ErrorHandler(404, "No tasks found"));
        }

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            tasks
        });

    } catch (error) {
        return next(new ErrorHandler(500, "Internal server error"));
    }
};



interface UpdateTaskStatusBody {
    status: TaskStatus;
    lastModifiedBy: string;
    comment?: string;
}

export const updateTaskStatus = async (
    req: AuthenticatedRequest & { body: UpdateTaskStatusBody },
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const { status, comment } = req.body;
        const taskId = req.params.id;


        // Validate task ID
        if (!Types.ObjectId.isValid(taskId)) {
            return next(new ErrorHandler(400, "Invalid task ID"));
        }

        // Validate status
        if (!Object.values(TaskStatus).includes(status)) {
            return next(new ErrorHandler(400, "Invalid status value"));
        }

        // Find task and validate existence
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new ErrorHandler(404, "Task not found"));
        }

        // Check if the user has permission to move the task
        const canMove = task.canUserMoveToStatus(
            new Types.ObjectId(req.user.userId),
            status
        );

        if (!canMove) {
            const errorMessage = status === TaskStatus.DONE
                ? 'Only the task owner can move tasks to Done status'
                : 'You must be either the owner or assignee to move this task';
            return next(new ErrorHandler(403, errorMessage));
        }

        // Update status and add to history
        const previousStatus = task.status;
        task.status = status;
        task.addStatusHistory(
            new Types.ObjectId(req.user.userId),
            status,
            comment || `Status changed from ${previousStatus} to ${status}`
        );

        // Save the updated task
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: {
                task,
                previousStatus,
                newStatus: status
            }
        });

    } catch (error) {
        console.error('Error updating task status:', error);
        return next(new ErrorHandler(500, "Internal server error"));
    }
};


interface UserResponse {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}


export const getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        // Fetch users with selected fields
        const users = await User.find(
            { _id: { $ne: req.user.userId } },
            'firstName lastName email'
        ).lean();

        // Transform the data to ensure sensitive information is removed
        const sanitizedUsers: UserResponse[] = users.map(user => ({
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }));

        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            users: sanitizedUsers,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return next(new ErrorHandler(500, "Internal server error"));
    }
};



export const deleteTask = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return next(new ErrorHandler(401, "Task not found"));
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Task deleted successfully' });

    } catch (error) {
        console.error('Error in Deleting Task:', error);
        return next(new ErrorHandler(500, "Internal server error"));
    }
};




export const updateTask = async (
    req: AuthenticatedRequest & { body: CreateTaskBody },
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const {
            title,
            description,
            priority,
            assigneeId,
            labels,
            dueDate,
            status
        } = req.body;

        const taskId = req.params.id;


        // Input validation
        if (!title?.trim()) {
            return next(new ErrorHandler(400, "Title is required"));
        }

        if (!description?.trim()) {
            return next(new ErrorHandler(400, "Description is required"));
        }


        if (!Object.values(Priority).includes(priority)) {
            return next(new ErrorHandler(400, "Invalid priority value"));
        }

        if (!Object.values(TaskStatus).includes(status)) {
            return next(new ErrorHandler(400, "Invalid status value"));
        }

        // Validate assigneeId is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(assigneeId)) {
            return next(new ErrorHandler(400, "Invalid assignee ID"));
        }

        // Validate dueDate is a valid date
        const parsedDueDate = new Date(dueDate);
        if (isNaN(parsedDueDate.getTime())) {
            return next(new ErrorHandler(400, "Invalid due date"));
        }

        // Validate labels array
        if (!Array.isArray(labels)) {
            return next(new ErrorHandler(400, "Labels must be an array"));
        }

        // Store user ID in a variable after authentication check
        // const userId = req.user.userId;



        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            req.body,
            { new: true }
        );


        res.json({ success: true, data: { task: updatedTask } });

    } catch (error) {
        console.error('Error updating task status:', error);
        return next(new ErrorHandler(500, "Internal server error"));
    }
};