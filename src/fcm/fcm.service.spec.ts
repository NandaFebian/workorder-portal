import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from './fcm.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { Notification } from './schemas/notification.schema';
import { getQueueToken } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: jest.fn(),
    sendEachForMulticast: jest.fn(),
  })),
}));

describe('FcmService', () => {
  let service: FcmService;
  let userModel: any;
  let notificationModel: any;
  let notificationQueue: any;

  const mockUserModel = {
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    findById: jest.fn(),
  };

  const mockNotificationModel = {
    create: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Silence logger during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Notification.name), useValue: mockNotificationModel },
        { provide: getQueueToken('notification'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);
    userModel = module.get(getModelToken(User.name));
    notificationModel = module.get(getModelToken(Notification.name));
    notificationQueue = module.get(getQueueToken('notification'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerToken()', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = 'fcm-device-token-12345';

    it('UT-FCM-001: should add token to user via $addToSet', async () => {
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.registerToken(userId, token);

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $addToSet: { fcmTokens: token } },
      );
    });

    it('UT-FCM-002: should not throw on duplicate token', async () => {
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      await expect(
        service.registerToken(userId, token),
      ).resolves.not.toThrow();
    });

    it('UT-FCM-003: should handle database error gracefully', async () => {
      mockUserModel.updateOne.mockRejectedValue(new Error('DB timeout'));

      await expect(
        service.registerToken(userId, token),
      ).resolves.not.toThrow();
    });
  });

  describe('removeToken()', () => {
    const token = 'fcm-device-token-to-remove';

    it('UT-FCM-004: should remove token from all users via $pull', async () => {
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await service.removeToken(token);

      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { fcmTokens: token },
        { $pull: { fcmTokens: token } },
      );
    });

    it('UT-FCM-005: should handle non-existent token gracefully', async () => {
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 0 });

      await expect(service.removeToken(token)).resolves.not.toThrow();
    });

    it('UT-FCM-006: should handle database error gracefully', async () => {
      mockUserModel.updateMany.mockRejectedValue(new Error('DB error'));

      await expect(service.removeToken(token)).resolves.not.toThrow();
    });
  });

  describe('getInbox()', () => {
    const userId = '507f1f77bcf86cd799439011';
    const mockNotifications = [
      { _id: 'notif1', title: 'Test 1', body: 'Body 1', isRead: false },
      { _id: 'notif2', title: 'Test 2', body: 'Body 2', isRead: true },
    ];

    it('UT-FCM-007: should return notifications sorted by createdAt desc', async () => {
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const selectMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockReturnThis();
      const execMock = jest.fn().mockResolvedValue(mockNotifications);

      mockNotificationModel.find.mockReturnValue({
        select: selectMock,
        sort: sortMock,
        limit: limitMock,
        lean: leanMock,
        exec: execMock,
      });

      const result = await service.getInbox(userId);

      expect(mockNotificationModel.find).toHaveBeenCalledWith({ userId });
      expect(selectMock).toHaveBeenCalledWith('-__v -updatedAt');
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(limitMock).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockNotifications);
    });

    it('UT-FCM-008: should return empty array when no notifications', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockNotificationModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      const result = await service.getInbox(userId);

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead()', () => {
    it('UT-FCM-009: should mark notification as read', async () => {
      const notificationId = '507f1f77bcf86cd799439099';
      const execResolve = jest.fn().mockResolvedValue({ modifiedCount: 1 });
      mockNotificationModel.updateOne.mockReturnValue({ exec: execResolve });

      await service.markAsRead(notificationId);

      expect(mockNotificationModel.updateOne).toHaveBeenCalledWith(
        { _id: expect.anything() },
        { $set: { isRead: true, readAt: expect.any(Date) } },
      );
    });

    it('UT-FCM-010: should warn on invalid ObjectId and return early', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await service.markAsRead('invalid-id');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid notification ID'),
      );
      expect(mockNotificationModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('markAsReadByResource()', () => {
    it('UT-FCM-011: should mark unread notifications by resource as read', async () => {
      mockNotificationModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await service.markAsReadByResource(
        '507f1f77bcf86cd799439011',
        'work_order',
        'wo-123',
      );

      expect(mockNotificationModel.updateMany).toHaveBeenCalledWith(
        {
          userId: expect.anything(),
          'data.resource': 'work_order',
          'data.resourceId': 'wo-123',
          isRead: false,
        },
        { $set: { isRead: true } },
      );
    });
  });

  describe('markAsReadByType()', () => {
    it('UT-FCM-012: should mark all notifications of a type as read', async () => {
      mockNotificationModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      await service.markAsReadByType('507f1f77bcf86cd799439011', 'work_order');

      expect(mockNotificationModel.updateMany).toHaveBeenCalledWith(
        {
          userId: expect.anything(),
          'data.resource': 'work_order',
          isRead: false,
        },
        { $set: { isRead: true } },
      );
    });
  });

  describe('sendToUser()', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('UT-FCM-013: should save notification and enqueue FCM job', async () => {
      mockNotificationModel.create.mockResolvedValue({ _id: 'notif-1' });
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      await service.sendToUser(userId, 'Title', 'Body', {
        resource: 'test',
        resourceId: '123',
      });

      expect(mockNotificationModel.create).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'sendFcmNotification',
        { userId, title: 'Title', body: 'Body', data: expect.any(Object) },
        expect.objectContaining({ attempts: 3 }),
      );
    });

    it('UT-FCM-014: should fallback to direct send when queue fails', async () => {
      const fallbackSpy = jest
        .spyOn(service, 'sendFcmDirect')
        .mockResolvedValue(undefined);
      mockNotificationModel.create.mockResolvedValue({ _id: 'notif-1' });
      mockQueue.add.mockRejectedValue(new Error('Redis down'));

      await service.sendToUser(userId, 'Title', 'Body', {});

      expect(fallbackSpy).toHaveBeenCalledWith(userId, 'Title', 'Body', {});
    });
  });
});
