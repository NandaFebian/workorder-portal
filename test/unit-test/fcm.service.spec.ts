import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from 'src/fcm/fcm.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Notification } from 'src/fcm/schemas/notification.schema';
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

describe('FcmService (Notifications Module)', () => {
  let service: FcmService;
  let notificationModel: any;
  let userModel: any;
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

  // ─── UT-NOTIF-001: sendNotification() positif ───

  describe('sendNotification()', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('UT-NOTIF-001: Mengirim notifikasi dengan token FCM valid → respons antrean berhasil', async () => {
      mockNotificationModel.create.mockResolvedValue({ _id: 'notif-1' });
      mockQueue.add.mockResolvedValue({ id: 'job-1' });

      await service.sendToUser(userId, 'Test Title', 'Test Body', {
        resource: 'work_order',
        resourceId: '123',
      });

      expect(mockNotificationModel.create).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'sendFcmNotification',
        { userId, title: 'Test Title', body: 'Test Body', data: expect.any(Object) },
        expect.objectContaining({ attempts: 3 }),
      );
    });

    it('UT-NOTIF-002: Mengirim notifikasi dengan token FCM invalid → fallback direct send', async () => {
      const fallbackSpy = jest.spyOn(service, 'sendFcmDirect').mockResolvedValue(undefined);
      mockNotificationModel.create.mockResolvedValue({ _id: 'notif-1' });
      mockQueue.add.mockRejectedValue(new Error('Redis down'));

      await service.sendToUser(userId, 'Title', 'Body', {});

      expect(fallbackSpy).toHaveBeenCalledWith(userId, 'Title', 'Body', {});
    });

    it('UT-NOTIF-003: Mengirim notifikasi tanpa body/title → tetap membuat notification record', async () => {
      mockNotificationModel.create.mockResolvedValue({ _id: 'notif-empty' });
      mockQueue.add.mockResolvedValue({ id: 'job-2' });

      await service.sendToUser(userId, '', '', {});

      expect(mockNotificationModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.anything(),
          title: '',
          body: '',
        }),
      );
    });
  });
});
