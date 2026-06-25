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

// Reference the mutable mock object (the ESM namespace import is read-only)
const admin: any = jest.requireMock('firebase-admin');

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
    // Reset the simulated Firebase init state between tests
    (admin as any).apps = [];
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

  // ─── Manajemen Token FCM ───

  describe('registerToken() & removeToken()', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('UT-NOTIF-004: Mendaftarkan token FCM → menambah token ke profil user', async () => {
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.registerToken(userId, 'token-abc');

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $addToSet: { fcmTokens: 'token-abc' } },
      );
    });

    it('UT-NOTIF-005: Menghapus token FCM → token ditarik dari seluruh profil user', async () => {
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await service.removeToken('token-abc');

      expect(mockUserModel.updateMany).toHaveBeenCalledWith(
        { fcmTokens: 'token-abc' },
        { $pull: { fcmTokens: 'token-abc' } },
      );
    });
  });

  // ─── Penandaan Notifikasi Dibaca ───

  describe('markAsRead() & turunannya', () => {
    const userId = '507f1f77bcf86cd799439011';
    const notifId = '507f1f77bcf86cd799439022';

    it('UT-NOTIF-006: Menandai notifikasi dibaca dengan ID valid → update record', async () => {
      mockNotificationModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.markAsRead(notifId);

      expect(mockNotificationModel.updateOne).toHaveBeenCalled();
    });

    it('UT-NOTIF-007: Menandai notifikasi dibaca dengan ID tidak valid → dilewati tanpa update', async () => {
      await service.markAsRead('invalid-id');

      expect(mockNotificationModel.updateOne).not.toHaveBeenCalled();
    });

    it('UT-NOTIF-008: Menandai dibaca berdasarkan resource → updateMany dipanggil', async () => {
      mockNotificationModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
      });

      await service.markAsReadByResource(userId, 'work_order', '123');

      expect(mockNotificationModel.updateMany).toHaveBeenCalled();
    });

    it('UT-NOTIF-009: Menandai dibaca berdasarkan tipe resource → updateMany dipanggil', async () => {
      mockNotificationModel.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }),
      });

      await service.markAsReadByType(userId, 'invitation');

      expect(mockNotificationModel.updateMany).toHaveBeenCalled();
    });
  });

  // ─── Inbox & Pengiriman Langsung ───

  describe('getInbox() & sendFcmDirect()', () => {
    const userId = '507f1f77bcf86cd799439011';

    it('UT-NOTIF-010: Mengambil inbox notifikasi user → array notifikasi', async () => {
      mockNotificationModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ _id: 'n1', title: 'Halo' }]),
      });

      const result = await service.getInbox(userId);

      expect(result).toHaveLength(1);
    });

    it('UT-NOTIF-011: Direct send saat user tidak punya token → tidak mengirim ke device', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ fcmTokens: [] }),
      });
      const spy = jest.spyOn(service, 'sendToMultipleDevices').mockResolvedValue(undefined);

      await service.sendFcmDirect(userId, 'T', 'B', {});

      expect(spy).not.toHaveBeenCalled();
    });

    it('UT-NOTIF-012: Direct send saat user punya token → mengirim ke seluruh device', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ fcmTokens: ['tok-1', 'tok-2'] }),
      });
      const spy = jest.spyOn(service, 'sendToMultipleDevices').mockResolvedValue(undefined);

      await service.sendFcmDirect(userId, 'T', 'B', { resource: 'work_order' });

      expect(spy).toHaveBeenCalledWith(['tok-1', 'tok-2'], 'T', 'B', { resource: 'work_order' });
    });
  });

  // ─── Pengiriman ke Device (Firebase) ───

  describe('sendToDevice() & sendToMultipleDevices()', () => {
    it('UT-NOTIF-013: Kirim ke device saat Firebase belum diinisialisasi → dilewati aman', async () => {
      (admin as any).apps = [];
      const sendMock = jest.fn();
      (admin as any).messaging = jest.fn(() => ({ send: sendMock }));

      await service.sendToDevice('tok', 'T', 'B', {});

      expect(sendMock).not.toHaveBeenCalled();
    });

    it('UT-NOTIF-014: Kirim ke device dengan token valid → memanggil Firebase messaging.send', async () => {
      (admin as any).apps = [{}];
      const sendMock = jest.fn().mockResolvedValue('msg-id');
      (admin as any).messaging = jest.fn(() => ({ send: sendMock }));

      await service.sendToDevice('tok', 'T', 'B', { resource: 'r', resourceId: '1' });

      expect(sendMock).toHaveBeenCalled();
    });

    it('UT-NOTIF-015: Multicast ke banyak device → memanggil sendEachForMulticast', async () => {
      (admin as any).apps = [{}];
      const multiMock = jest.fn().mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        responses: [{ success: true }, { success: true }],
      });
      (admin as any).messaging = jest.fn(() => ({ sendEachForMulticast: multiMock }));

      await service.sendToMultipleDevices(['tok-1', 'tok-2'], 'T', 'B', {});

      expect(multiMock).toHaveBeenCalled();
    });

    it('UT-NOTIF-016: Multicast dengan sebagian token gagal → membersihkan token invalid', async () => {
      (admin as any).apps = [{}];
      const multiMock = jest.fn().mockResolvedValue({
        successCount: 1,
        failureCount: 1,
        responses: [{ success: true }, { success: false }],
      });
      (admin as any).messaging = jest.fn(() => ({ sendEachForMulticast: multiMock }));
      mockUserModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await service.sendToMultipleDevices(['tok-ok', 'tok-bad'], 'T', 'B', {});

      expect(mockUserModel.updateMany).toHaveBeenCalled();
    });
  });
});
