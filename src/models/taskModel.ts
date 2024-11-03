import { Schema, model, Document, Model, Types } from 'mongoose';
import { IStatusHistory, ITask } from '../interfaces/modelInterfaces';
import { Priority, TaskStatus } from '../types/modelTypes';

interface ITaskDocument extends ITask, Document {
    canUserMoveToStatus(userId: Types.ObjectId, newStatus: TaskStatus): boolean;
    addStatusHistory(userId: Types.ObjectId, newStatus: TaskStatus, comment?: string): void;
}

const statusHistorySchema = new Schema<IStatusHistory>({
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        required: true
    },
    changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    comment: String
});

const taskSchema = new Schema<ITaskDocument>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(TaskStatus),
        default: TaskStatus.OPEN,
        required: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigneeId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: Object.values(Priority),
        default: Priority.MEDIUM
    },
    dueDate: Date,
    labels: [{
        type: String,
        trim: true
    }],
    statusHistory: [statusHistorySchema]
}, {
    timestamps: true
});


// Task methods for permission checking
taskSchema.methods.canUserMoveToStatus = function (
    userId: Types.ObjectId,
    newStatus: TaskStatus
): boolean {
    // If moving to DONE, only owner can do it
    if (newStatus === TaskStatus.DONE) {
        return this.ownerId.equals(userId);
    }

    // For other statuses, both owner and assignee can move
    return this.ownerId.equals(userId) ||
        (this.assigneeId && this.assigneeId.equals(userId));
};

taskSchema.methods.addStatusHistory = function (
    userId: Types.ObjectId,
    newStatus: TaskStatus,
    comment?: string
) {
    this.statusHistory.push({
        status: newStatus,
        changedBy: userId,
        changedAt: new Date(),
        comment
    });
};

// Indexes for common queries
taskSchema.index({ ownerId: 1, status: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

// // Middleware to enforce task movement rules
// taskSchema.pre('save', async function (next) {
//     if (this.isModified('status')) {
//         const canMove = this.canUserMoveToStatus(this.get('lastModifiedBy'), this.status);
//         if (!canMove) {
//             const errorMessage = this.status === TaskStatus.DONE
//                 ? 'Only the task owner can move tasks to Done status'
//                 : 'You must be either the owner or assignee to move this task';
//             throw new Error(errorMessage);
//         }
//     }
//     next();
// });

export const Task = model<ITaskDocument>('Task', taskSchema);
