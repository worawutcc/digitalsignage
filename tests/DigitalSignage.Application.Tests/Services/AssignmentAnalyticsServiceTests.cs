using AutoFixture;
using AutoFixture.AutoMoq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using DigitalSignage.Application.DTOs;
using DigitalSignage.Application.DTOs.Assignment;
using DigitalSignage.Application.Interfaces;
using DigitalSignage.Application.Services;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Domain.Interfaces;

namespace DigitalSignage.Application.Tests.Services;

/// <summary>
/// Comprehensive unit tests for Assignment Analytics Service
/// covering metrics collection, performance monitoring, usage analytics, and reporting
/// following TDD approach and copilot API instruction standards
/// </summary>
public class AssignmentAnalyticsServiceTests
{
    private readonly IFixture _fixture;
    private readonly Mock<IAssignmentRepository> _mockAssignmentRepository;
    private readonly Mock<IDeviceRepository> _mockDeviceRepository;
    private readonly Mock<ILogger<AssignmentAnalyticsService>> _mockLogger;
    private readonly AssignmentAnalyticsService _service;

    public AssignmentAnalyticsServiceTests()
    {
        _fixture = new Fixture().Customize(new AutoMoqCustomization());
        _mockAssignmentRepository = new Mock<IAssignmentRepository>();
        _mockDeviceRepository = new Mock<IDeviceRepository>();
        _mockLogger = new Mock<ILogger<AssignmentAnalyticsService>>();

        _service = new AssignmentAnalyticsService(
            _mockAssignmentRepository.Object,
            _mockDeviceRepository.Object,
            _mockLogger.Object);
    }

    #region Assignment Metrics Tests

    [Fact]
    public async Task GetAssignmentMetricsAsync_WithValidDateRange_ShouldReturnCorrectMetrics()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(50).ToList();
        
        // Set up different statuses for testing
        assignments[0].Status = AssignmentStatus.Active;
        assignments[1].Status = AssignmentStatus.Expired;
        assignments[2].Status = AssignmentStatus.Cancelled;
        assignments[3].Status = AssignmentStatus.Draft;
        assignments[4].Status = AssignmentStatus.Paused;

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(
                It.IsAny<DateTime>(), 
                It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetAssignmentMetricsAsync(dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.TotalAssignments.Should().Be(50);
        result.ActiveAssignments.Should().Be(1);
        result.ExpiredAssignments.Should().Be(1);
        result.CancelledAssignments.Should().Be(1);
        result.DraftAssignments.Should().Be(1);
        result.PausedAssignments.Should().Be(1);
        result.AnalysisPeriodStart.Should().BeCloseTo(dateFrom, TimeSpan.FromSeconds(1));
        result.AnalysisPeriodEnd.Should().BeCloseTo(dateTo, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetAssignmentMetricsAsync_WithNoAssignments_ShouldReturnZeroMetrics()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        
        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(new List<Assignment>());

        // Act
        var result = await _service.GetAssignmentMetricsAsync(dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.TotalAssignments.Should().Be(0);
        result.ActiveAssignments.Should().Be(0);
        result.ExpiredAssignments.Should().Be(0);
        result.CancelledAssignments.Should().Be(0);
        result.DraftAssignments.Should().Be(0);
        result.PausedAssignments.Should().Be(0);
    }

    [Theory]
    [InlineData(-1, 1)] // Invalid date range
    [InlineData(0, -1)] // Invalid date range
    public async Task GetAssignmentMetricsAsync_WithInvalidDateRange_ShouldThrowArgumentException(int daysFromOffset, int daysToOffset)
    {
        // Arrange
        var baseDate = DateTime.UtcNow;
        var dateFrom = baseDate.AddDays(daysFromOffset);
        var dateTo = baseDate.AddDays(daysToOffset);

        // Act & Assert
        await _service.Invoking(s => s.GetAssignmentMetricsAsync(dateFrom, dateTo))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*date range*");
    }

    [Fact]
    public async Task GetAssignmentMetricsByContentAsync_WithValidContentId_ShouldReturnContentSpecificMetrics()
    {
        // Arrange
        var contentId = 123;
        var assignmentType = AssignmentType.Playlist;
        var assignments = _fixture.CreateMany<Assignment>(10).ToList();
        
        foreach (var assignment in assignments)
        {
            assignment.ContentId = contentId;
            assignment.AssignmentType = assignmentType;
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByContentAsync(contentId, assignmentType))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetAssignmentMetricsByContentAsync(contentId, assignmentType);

        // Assert
        result.Should().NotBeNull();
        result.ContentId.Should().Be(contentId);
        result.AssignmentType.Should().Be(assignmentType);
        result.TotalAssignments.Should().Be(10);
    }

    [Fact]
    public async Task GetAssignmentMetricsByTargetAsync_WithValidTarget_ShouldReturnTargetSpecificMetrics()
    {
        // Arrange
        var targetType = AssignmentTargetType.Device;
        var targetId = 456;
        var assignments = _fixture.CreateMany<Assignment>(15).ToList();
        
        foreach (var assignment in assignments)
        {
            assignment.TargetType = targetType;
            assignment.TargetId = targetId;
        }

        _mockAssignmentRepository
            .Setup(x => x.GetActiveAssignmentsForTargetAsync(targetType, targetId))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetAssignmentMetricsByTargetAsync(targetType, targetId);

        // Assert
        result.Should().NotBeNull();
        result.TargetType.Should().Be(targetType);
        result.TargetId.Should().Be(targetId);
        result.TotalAssignments.Should().Be(15);
    }

    [Fact]
    public async Task GetPriorityDistributionAsync_WithAssignments_ShouldReturnCorrectDistribution()
    {
        // Arrange
        var assignments = new List<Assignment>();
        
        // Create assignments with different priorities (1-10 scale)
        for (int priority = 1; priority <= 10; priority++)
        {
            for (int count = 0; count < priority; count++) // More assignments for higher priorities
            {
                var assignment = _fixture.Create<Assignment>();
                assignment.Priority = priority;
                assignments.Add(assignment);
            }
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetPriorityDistributionAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(10);
        
        for (int priority = 1; priority <= 10; priority++)
        {
            result.Should().ContainKey(priority);
            result[priority].Should().Be(priority); // Number of assignments equals priority
        }
    }

    #endregion

    #region Performance Analytics Tests

    [Fact]
    public async Task GetPerformanceMetricsAsync_WithValidDateRange_ShouldReturnPerformanceData()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-7);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(100).ToList();
        
        // Set up assignment dates within range
        for (int i = 0; i < assignments.Count; i++)
        {
            assignments[i].CreatedAt = DateTime.SpecifyKind(dateFrom.AddHours(i), DateTimeKind.Unspecified);
            assignments[i].StartDate = assignments[i].CreatedAt.AddMinutes(30);
            assignments[i].EndDate = assignments[i].StartDate.AddHours(2);
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetPerformanceMetricsAsync(dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.AverageAssignmentsPerDay.Should().BeGreaterThan(0);
        result.PeakAssignmentHour.Should().BeInRange(0, 23);
        result.AverageAssignmentDuration.Should().BeGreaterThan(TimeSpan.Zero);
        result.AnalysisPeriodStart.Should().BeCloseTo(dateFrom, TimeSpan.FromSeconds(1));
        result.AnalysisPeriodEnd.Should().BeCloseTo(dateTo, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetSystemHealthMetricsAsync_ShouldReturnHealthStatus()
    {
        // Arrange
        var activeAssignments = _fixture.CreateMany<Assignment>(25).ToList();
        var overlapCount = 5;
        var failureRate = 0.02; // 2% failure rate

        foreach (var assignment in activeAssignments)
        {
            assignment.Status = AssignmentStatus.Active;
        }

        _mockAssignmentRepository
            .Setup(x => x.GetActiveAssignmentsAsync())
            .ReturnsAsync(activeAssignments);

        _mockAssignmentRepository
            .Setup(x => x.GetOverlappingAssignmentsCountAsync())
            .ReturnsAsync(overlapCount);

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentFailureRateAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(failureRate);

        // Act
        var result = await _service.GetSystemHealthMetricsAsync();

        // Assert
        result.Should().NotBeNull();
        result.ActiveAssignmentCount.Should().Be(25);
        result.ConflictingAssignmentCount.Should().Be(overlapCount);
        result.SystemFailureRate.Should().Be(failureRate);
        result.HealthStatus.Should().BeOneOf("Healthy", "Warning", "Critical");
        result.LastAnalyzed.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
    }

    [Theory]
    [InlineData(0, 0, 0.0, "Healthy")]
    [InlineData(100, 5, 0.01, "Healthy")]
    [InlineData(100, 15, 0.05, "Warning")]
    [InlineData(100, 25, 0.15, "Critical")]
    public async Task GetSystemHealthMetricsAsync_WithDifferentScenarios_ShouldReturnCorrectHealthStatus(
        int activeCount, int conflictCount, double failureRate, string expectedStatus)
    {
        // Arrange
        var activeAssignments = _fixture.CreateMany<Assignment>(activeCount).ToList();

        _mockAssignmentRepository
            .Setup(x => x.GetActiveAssignmentsAsync())
            .ReturnsAsync(activeAssignments);

        _mockAssignmentRepository
            .Setup(x => x.GetOverlappingAssignmentsCountAsync())
            .ReturnsAsync(conflictCount);

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentFailureRateAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(failureRate);

        // Act
        var result = await _service.GetSystemHealthMetricsAsync();

        // Assert
        result.HealthStatus.Should().Be(expectedStatus);
    }

    #endregion

    #region Usage Analytics Tests

    [Fact]
    public async Task GetUsageAnalyticsAsync_WithValidParameters_ShouldReturnUsageData()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(200).ToList();
        var devices = _fixture.CreateMany<Device>(50).ToList();

        // Set up assignment types distribution
        for (int i = 0; i < assignments.Count; i++)
        {
            assignments[i].AssignmentType = (AssignmentType)(i % 3); // Distribute among 3 types
            assignments[i].TargetType = AssignmentTargetType.Device;
            assignments[i].TargetId = devices[i % devices.Count].Id;
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        _mockDeviceRepository
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(devices);

        // Act
        var result = await _service.GetUsageAnalyticsAsync(dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.TotalAssignments.Should().Be(200);
        result.MostUsedAssignmentType.Should().BeOneOf(Enum.GetValues<AssignmentType>());
        result.DeviceUtilizationRate.Should().BeInRange(0, 1);
        result.AssignmentTypeDistribution.Should().NotBeEmpty();
        result.AnalysisPeriodStart.Should().BeCloseTo(dateFrom, TimeSpan.FromSeconds(1));
        result.AnalysisPeriodEnd.Should().BeCloseTo(dateTo, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetDeviceUsageRankingAsync_WithAssignments_ShouldReturnRankedDevices()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-7);
        var dateTo = DateTime.UtcNow;
        var limit = 10;
        
        var devices = _fixture.CreateMany<Device>(20).ToList();
        var assignments = new List<Assignment>();

        // Create more assignments for some devices (to create ranking)
        for (int deviceIndex = 0; deviceIndex < devices.Count; deviceIndex++)
        {
            var assignmentCount = 20 - deviceIndex; // Decreasing assignment count
            for (int i = 0; i < assignmentCount; i++)
            {
                var assignment = _fixture.Create<Assignment>();
                assignment.TargetType = AssignmentTargetType.Device;
                assignment.TargetId = devices[deviceIndex].Id;
                assignment.CreatedAt = DateTime.SpecifyKind(dateFrom.AddHours(i), DateTimeKind.Unspecified);
                assignments.Add(assignment);
            }
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        _mockDeviceRepository
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(devices);

        // Act
        var result = await _service.GetDeviceUsageRankingAsync(dateFrom, dateTo, limit);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCountLessOrEqualTo(limit);
        
        // Verify ranking order (first device should have most assignments)
        if (result.Any())
        {
            var sortedResult = result.OrderByDescending(r => r.AssignmentCount).ToList();
            result.Should().BeEquivalentTo(sortedResult, options => options.WithStrictOrdering());
        }
    }

    [Fact]
    public async Task GetContentPopularityAsync_WithAssignments_ShouldReturnRankedContent()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        var limit = 15;
        
        var assignments = new List<Assignment>();
        var contentIds = Enumerable.Range(1, 25).ToList();

        // Create assignments with varying content popularity
        foreach (var contentId in contentIds)
        {
            var assignmentCount = 26 - contentId; // Decreasing popularity
            for (int i = 0; i < assignmentCount; i++)
            {
                var assignment = _fixture.Create<Assignment>();
                assignment.ContentId = contentId;
                assignment.CreatedAt = DateTime.SpecifyKind(dateFrom.AddHours(i), DateTimeKind.Unspecified);
                assignments.Add(assignment);
            }
        }

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GetContentPopularityAsync(dateFrom, dateTo, limit);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCountLessOrEqualTo(limit);
        
        // Verify ranking order (content with ID 1 should be most popular)
        if (result.Any())
        {
            var sortedResult = result.OrderByDescending(r => r.AssignmentCount).ToList();
            result.Should().BeEquivalentTo(sortedResult, options => options.WithStrictOrdering());
            result.First().ContentId.Should().Be(1); // Most popular content
        }
    }

    #endregion

    #region Reporting Tests

    [Fact]
    public async Task GenerateAssignmentReportAsync_WithStandardReport_ShouldReturnComprehensiveReport()
    {
        // Arrange
        var reportType = AssignmentReportType.Standard;
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(100).ToList();

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.GenerateAssignmentReportAsync(reportType, dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.ReportType.Should().Be(reportType);
        result.GeneratedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        result.PeriodStart.Should().BeCloseTo(dateFrom, TimeSpan.FromSeconds(1));
        result.PeriodEnd.Should().BeCloseTo(dateTo, TimeSpan.FromSeconds(1));
        result.TotalRecords.Should().Be(100);
        result.ReportData.Should().NotBeNullOrEmpty();
    }

    [Theory]
    [InlineData(AssignmentReportType.Standard)]
    [InlineData(AssignmentReportType.Performance)]
    [InlineData(AssignmentReportType.Usage)]
    [InlineData(AssignmentReportType.Conflicts)]
    public async Task GenerateAssignmentReportAsync_WithDifferentReportTypes_ShouldReturnAppropriateReport(
        AssignmentReportType reportType)
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-7);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(50).ToList();

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        if (reportType == AssignmentReportType.Conflicts)
        {
            _mockAssignmentRepository
                .Setup(x => x.GetOverlappingAssignmentsCountAsync())
                .ReturnsAsync(5);
        }

        // Act
        var result = await _service.GenerateAssignmentReportAsync(reportType, dateFrom, dateTo);

        // Assert
        result.Should().NotBeNull();
        result.ReportType.Should().Be(reportType);
        result.ReportData.Should().NotBeNullOrEmpty();
        
        // Verify report contains appropriate data based on type
        switch (reportType)
        {
            case AssignmentReportType.Performance:
                result.ReportData.Should().Contain("performance", Exactly.Once());
                break;
            case AssignmentReportType.Usage:
                result.ReportData.Should().Contain("usage", Exactly.Once());
                break;
            case AssignmentReportType.Conflicts:
                result.ReportData.Should().Contain("conflicts", Exactly.Once());
                break;
        }
    }

    [Fact]
    public async Task ExportAnalyticsDataAsync_WithJsonFormat_ShouldReturnJsonExport()
    {
        // Arrange
        var exportRequest = new AnalyticsExportRequest
        {
            DateFrom = DateTime.UtcNow.AddDays(-7),
            DateTo = DateTime.UtcNow,
            Format = "JSON",
            IncludeMetrics = true,
            IncludePerformance = true,
            IncludeUsage = false
        };

        var assignments = _fixture.CreateMany<Assignment>(30).ToList();
        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.ExportAnalyticsDataAsync(exportRequest);

        // Assert
        result.Should().NotBeNull();
        result.Format.Should().Be("JSON");
        result.Data.Should().NotBeNullOrEmpty();
        result.Size.Should().BeGreaterThan(0);
        result.ExportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        
        // Verify JSON format
        result.Data.Should().StartWith("{").And.EndWith("}");
    }

    [Theory]
    [InlineData("JSON")]
    [InlineData("CSV")]
    [InlineData("XML")]
    public async Task ExportAnalyticsDataAsync_WithDifferentFormats_ShouldReturnCorrectFormat(string format)
    {
        // Arrange
        var exportRequest = new AnalyticsExportRequest
        {
            DateFrom = DateTime.UtcNow.AddDays(-7),
            DateTo = DateTime.UtcNow,
            Format = format,
            IncludeMetrics = true
        };

        var assignments = _fixture.CreateMany<Assignment>(10).ToList();
        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);

        // Act
        var result = await _service.ExportAnalyticsDataAsync(exportRequest);

        // Assert
        result.Should().NotBeNull();
        result.Format.Should().Be(format);
        result.Data.Should().NotBeNullOrEmpty();
        
        // Verify format-specific structure
        switch (format.ToUpperInvariant())
        {
            case "JSON":
                result.Data.Should().StartWith("{").And.EndWith("}");
                break;
            case "CSV":
                result.Data.Should().Contain(",");
                break;
            case "XML":
                result.Data.Should().StartWith("<").And.EndWith(">");
                break;
        }
    }

    #endregion

    #region Error Handling Tests

    [Fact]
    public async Task GetAssignmentMetricsAsync_WhenRepositoryThrows_ShouldLogErrorAndRethrow()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-7);
        var dateTo = DateTime.UtcNow;
        var expectedException = new InvalidOperationException("Database connection failed");

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ThrowsAsync(expectedException);

        // Act & Assert
        await _service.Invoking(s => s.GetAssignmentMetricsAsync(dateFrom, dateTo))
            .Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Database connection failed");

        // Verify logging
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Error getting assignment metrics")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GenerateAssignmentReportAsync_WithInvalidDateRange_ShouldThrowArgumentException()
    {
        // Arrange
        var reportType = AssignmentReportType.Standard;
        var dateFrom = DateTime.UtcNow;
        var dateTo = DateTime.UtcNow.AddDays(-1); // Invalid: end before start

        // Act & Assert
        await _service.Invoking(s => s.GenerateAssignmentReportAsync(reportType, dateFrom, dateTo))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*date range*");
    }

    [Fact]
    public async Task ExportAnalyticsDataAsync_WithUnsupportedFormat_ShouldThrowArgumentException()
    {
        // Arrange
        var exportRequest = new AnalyticsExportRequest
        {
            DateFrom = DateTime.UtcNow.AddDays(-7),
            DateTo = DateTime.UtcNow,
            Format = "UNSUPPORTED_FORMAT"
        };

        // Act & Assert
        await _service.Invoking(s => s.ExportAnalyticsDataAsync(exportRequest))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*format*");
    }

    #endregion

    #region Integration Tests

    [Fact]
    public async Task GetComprehensiveAnalyticsAsync_WithCompleteData_ShouldReturnAllMetrics()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-30);
        var dateTo = DateTime.UtcNow;
        var assignments = _fixture.CreateMany<Assignment>(100).ToList();
        var devices = _fixture.CreateMany<Device>(20).ToList();

        // Set up comprehensive test data
        for (int i = 0; i < assignments.Count; i++)
        {
            assignments[i].Status = (AssignmentStatus)(i % 5);
            assignments[i].Priority = (i % 10) + 1;
            assignments[i].AssignmentType = (AssignmentType)(i % 3);
            assignments[i].TargetType = AssignmentTargetType.Device;
            assignments[i].TargetId = devices[i % devices.Count].Id;
            assignments[i].CreatedAt = DateTime.SpecifyKind(dateFrom.AddHours(i), DateTimeKind.Unspecified);
        }

        _mockAssignmentRepository.Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(assignments);
        _mockAssignmentRepository.Setup(x => x.GetAllAsync()).ReturnsAsync(assignments);
        _mockAssignmentRepository.Setup(x => x.GetActiveAssignmentsAsync()).ReturnsAsync(assignments.Where(a => a.Status == AssignmentStatus.Active));
        _mockAssignmentRepository.Setup(x => x.GetOverlappingAssignmentsCountAsync()).ReturnsAsync(5);
        _mockAssignmentRepository.Setup(x => x.GetAssignmentFailureRateAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>())).ReturnsAsync(0.02);
        _mockDeviceRepository.Setup(x => x.GetAllAsync()).ReturnsAsync(devices);

        // Act
        var metricsTask = _service.GetAssignmentMetricsAsync(dateFrom, dateTo);
        var performanceTask = _service.GetPerformanceMetricsAsync(dateFrom, dateTo);
        var usageTask = _service.GetUsageAnalyticsAsync(dateFrom, dateTo);
        var healthTask = _service.GetSystemHealthMetricsAsync();

        await Task.WhenAll(metricsTask, performanceTask, usageTask, healthTask);

        var metrics = await metricsTask;
        var performance = await performanceTask;
        var usage = await usageTask;
        var health = await healthTask;

        // Assert
        metrics.Should().NotBeNull();
        performance.Should().NotBeNull();
        usage.Should().NotBeNull();
        health.Should().NotBeNull();

        // Verify data consistency across analytics
        metrics.TotalAssignments.Should().Be(usage.TotalAssignments);
        health.ActiveAssignmentCount.Should().BeGreaterOrEqualTo(0);
    }

    #endregion

    #region Performance Tests

    [Fact]
    public async Task GetAssignmentMetricsAsync_WithLargeDataset_ShouldCompleteWithinTimeout()
    {
        // Arrange
        var dateFrom = DateTime.UtcNow.AddDays(-365);
        var dateTo = DateTime.UtcNow;
        var largeAssignmentSet = _fixture.CreateMany<Assignment>(10000).ToList();

        _mockAssignmentRepository
            .Setup(x => x.GetAssignmentsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(largeAssignmentSet);

        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = await _service.GetAssignmentMetricsAsync(dateFrom, dateTo);
        stopwatch.Stop();

        // Assert
        result.Should().NotBeNull();
        result.TotalAssignments.Should().Be(10000);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000); // Should complete within 5 seconds
    }

    #endregion
}