using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Api.Models
{
    public class DeviceDto
    {
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = "Online";
        public string? Location { get; set; }
        public string? IpAddress { get; set; }
        public string? MacAddress { get; set; }
        public DateTime LastSeen { get; set; }
        public Guid? CurrentPlaylist { get; set; }
        public DeviceSystemInfoDto? SystemInfo { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class DeviceSystemInfoDto
    {
        public string? Os { get; set; }
        public string? Version { get; set; }
        public StorageInfoDto? Storage { get; set; }
        public string? Resolution { get; set; }
    }

    public class StorageInfoDto
    {
        public long Total { get; set; }
        public long Used { get; set; }
        public long Free { get; set; }
    }
}
