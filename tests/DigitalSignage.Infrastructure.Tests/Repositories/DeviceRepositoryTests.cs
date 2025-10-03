using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using DigitalSignage.Infrastructure.Repositories;
using DigitalSignage.Infrastructure.Data;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Infrastructure.Tests.Repositories
{
    public class DeviceRepositoryTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly DeviceRepository _repository;

        public DeviceRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _repository = new DeviceRepository(_context);
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllDevices()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Name = "Device 1", DeviceType = "AndroidTV", Status = DeviceStatus.Online },
                new Device { Name = "Device 2", DeviceType = "AndroidTV", Status = DeviceStatus.Offline }
            };

            _context.Devices.AddRange(devices);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsDevice_WhenDeviceExists()
        {
            // Arrange
            var device = new Device { Name = "Test Device", DeviceType = "AndroidTV" };
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(device.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(device.Name, result.Name);
        }

        [Fact]
        public async Task GetByIdAsync_ReturnsNull_WhenDeviceDoesNotExist()
        {
            // Act
            var result = await _repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddAsync_AddsDeviceToDatabase()
        {
            // Arrange
            var device = new Device { Name = "New Device", DeviceType = "AndroidTV" };

            // Act
            var result = await _repository.AddAsync(device);
            await _context.SaveChangesAsync();

            // Assert
            Assert.True(result.Id > 0);
            var deviceInDb = await _context.Devices.FindAsync(result.Id);
            Assert.NotNull(deviceInDb);
            Assert.Equal(device.Name, deviceInDb.Name);
        }

        [Fact]
        public async Task UpdateAsync_UpdatesDeviceInDatabase()
        {
            // Arrange
            var device = new Device { Name = "Original Name", DeviceType = "AndroidTV" };
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            // Act
            device.Name = "Updated Name";
            await _repository.UpdateAsync(device);
            await _context.SaveChangesAsync();

            // Assert
            var updatedDevice = await _context.Devices.FindAsync(device.Id);
            Assert.Equal("Updated Name", updatedDevice.Name);
        }

        [Fact]
        public async Task DeleteAsync_RemovesDeviceFromDatabase()
        {
            // Arrange
            var device = new Device { Name = "Device to Delete", DeviceType = "AndroidTV" };
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            // Act
            await _repository.DeleteAsync(device.Id);
            await _context.SaveChangesAsync();

            // Assert
            var deletedDevice = await _context.Devices.FindAsync(device.Id);
            Assert.Null(deletedDevice);
        }

        [Fact]
        public async Task GetByStatusAsync_ReturnsDevicesWithSpecificStatus()
        {
            // Arrange
            var devices = new List<Device>
            {
                new Device { Name = "Online Device", DeviceType = "AndroidTV", Status = DeviceStatus.Online },
                new Device { Name = "Offline Device", DeviceType = "AndroidTV", Status = DeviceStatus.Offline },
                new Device { Name = "Another Online Device", DeviceType = "AndroidTV", Status = DeviceStatus.Online }
            };

            _context.Devices.AddRange(devices);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByStatusAsync(DeviceStatus.Online);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.All(result, d => Assert.Equal(DeviceStatus.Online, d.Status));
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}