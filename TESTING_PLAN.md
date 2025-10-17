# LiveKit Migration Testing Plan

This document outlines the comprehensive testing strategy for the LiveKit migration.

## Pre-Testing Setup

1. **Environment Setup**
   ```bash
   # Run the setup validation
   ./test-docker-setup.sh
   
   # Start all services
   ./docker-dev.sh
   ```

2. **Verify Services are Running**
   ```bash
   # Check all containers are up
   docker-compose ps
   
   # Check logs for any errors
   docker-compose logs --tail=50
   ```

## Phase 1: Docker Infrastructure Testing

### 1.1 Container Health Checks

- [ ] All containers start successfully
- [ ] PostgreSQL health check passes
- [ ] Redis is accessible
- [ ] LiveKit server starts without errors
- [ ] Backend API server starts
- [ ] Frontend builds and starts

### 1.2 Network Connectivity

- [ ] Frontend can reach backend API (http://localhost:1285)
- [ ] Frontend can reach LiveKit (ws://localhost:7880)
- [ ] Backend can reach PostgreSQL (postgres:5432)
- [ ] Backend can reach Redis (redis:6379)
- [ ] LiveKit can reach Redis (redis:6379)

### 1.3 Port Accessibility

- [ ] Frontend: http://localhost:3000
- [ ] Backend API: http://localhost:1285
- [ ] LiveKit WebSocket: ws://localhost:7880
- [ ] LiveKit HTTP: http://localhost:7880
- [ ] PostgreSQL: localhost:5434
- [ ] Redis: localhost:6379

## Phase 2: Mediasoup Testing (Feature Flag OFF)

Set `NEXT_PUBLIC_USE_LIVEKIT=false` in .env and restart web service.

### 2.1 Basic Functionality

- [ ] User can log in with Clerk authentication
- [ ] User can create a call/room
- [ ] User can join a call/room
- [ ] User can see their own video preview
- [ ] User can toggle camera on/off
- [ ] User can toggle microphone on/off

### 2.2 Multi-Participant Testing

- [ ] Two users can join the same room
- [ ] Both users can see each other's video
- [ ] Both users can hear each other's audio
- [ ] Users can toggle their camera/mic independently
- [ ] Users can leave and rejoin the room

### 2.3 Screen Sharing

- [ ] User can start screen sharing
- [ ] Other participants can see the shared screen
- [ ] User can stop screen sharing
- [ ] Screen sharing works with multiple participants

### 2.4 Device Management

- [ ] User can switch between different cameras
- [ ] User can switch between different microphones
- [ ] Device changes are reflected immediately
- [ ] Device permissions are handled correctly

### 2.5 Error Handling

- [ ] Graceful handling of network disconnections
- [ ] Proper error messages for permission denials
- [ ] Recovery from temporary connection issues
- [ ] Cleanup when users leave unexpectedly

## Phase 3: LiveKit Testing (Feature Flag ON)

Set `NEXT_PUBLIC_USE_LIVEKIT=true` in .env and restart web service.

### 3.1 Basic Functionality

- [ ] User can log in with Clerk authentication
- [ ] User can create a call/room
- [ ] User can join a call/room
- [ ] User can see their own video preview
- [ ] User can toggle camera on/off
- [ ] User can toggle microphone on/off

### 3.2 Multi-Participant Testing

- [ ] Two users can join the same room
- [ ] Both users can see each other's video
- [ ] Both users can hear each other's audio
- [ ] Users can toggle their camera/mic independently
- [ ] Users can leave and rejoin the room

### 3.3 Screen Sharing

- [ ] User can start screen sharing
- [ ] Other participants can see the shared screen
- [ ] User can stop screen sharing
- [ ] Screen sharing works with multiple participants

### 3.4 Device Management

- [ ] User can switch between different cameras
- [ ] User can switch between different microphones
- [ ] Device changes are reflected immediately
- [ ] Device permissions are handled correctly

### 3.5 LiveKit-Specific Features

- [ ] LiveKit token generation works correctly
- [ ] Room auto-creation works
- [ ] Participant metadata is preserved
- [ ] Track publication/unpublication works
- [ ] Audio level detection works (if implemented)

### 3.6 Error Handling

- [ ] Graceful handling of network disconnections
- [ ] Proper error messages for permission denials
- [ ] Recovery from temporary connection issues
- [ ] Cleanup when users leave unexpectedly
- [ ] LiveKit-specific error handling

## Phase 4: Performance Testing

### 4.1 Load Testing

- [ ] Test with 3-5 participants simultaneously
- [ ] Test with 10+ participants (if possible)
- [ ] Monitor CPU and memory usage
- [ ] Check for memory leaks during long sessions

### 4.2 Network Testing

- [ ] Test with different network conditions
- [ ] Test with poor network connectivity
- [ ] Test with high latency
- [ ] Test with packet loss

### 4.3 Resource Usage

- [ ] Monitor Docker container resource usage
- [ ] Check for memory leaks
- [ ] Monitor CPU usage during calls
- [ ] Check disk usage for logs

## Phase 5: Integration Testing

### 5.1 Authentication Integration

- [ ] Clerk authentication works with both Mediasoup and LiveKit
- [ ] User metadata is properly passed to both systems
- [ ] Session management works correctly

### 5.2 Database Integration

- [ ] Call records are created correctly
- [ ] User participation is tracked
- [ ] Call history is maintained

### 5.3 Real-time Features

- [ ] Chat functionality works (if implemented)
- [ ] Notifications work correctly
- [ ] Real-time updates are synchronized

## Phase 6: Browser Compatibility Testing

### 6.1 Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 6.2 Mobile Browsers

- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Firefox Mobile

### 6.3 WebRTC Support

- [ ] WebRTC is supported in all tested browsers
- [ ] Camera and microphone permissions work
- [ ] Screen sharing works (where supported)

## Phase 7: Security Testing

### 7.1 Authentication Security

- [ ] Only authenticated users can join calls
- [ ] User tokens are properly validated
- [ ] Session management is secure

### 7.2 Network Security

- [ ] WebRTC connections are encrypted
- [ ] API endpoints are properly secured
- [ ] No sensitive data is exposed in logs

## Test Execution Checklist

### Before Testing
- [ ] All services are running
- [ ] Environment variables are set correctly
- [ ] Test users are available
- [ ] Test devices are ready

### During Testing
- [ ] Document any issues found
- [ ] Take screenshots of problems
- [ ] Note performance metrics
- [ ] Record error messages

### After Testing
- [ ] Clean up test data
- [ ] Document test results
- [ ] Create issues for any bugs found
- [ ] Update documentation if needed

## Automated Testing

### Docker Health Checks
```bash
# Check all services
docker-compose ps

# Check service health
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping
curl http://localhost:7880/health  # LiveKit health check
curl http://localhost:1285/health  # Backend health check
```

### API Testing
```bash
# Test LiveKit token generation
curl -X POST http://localhost:1285/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room"}'
```

## Rollback Plan

If issues are found during testing:

1. **Immediate Rollback**
   - Set `NEXT_PUBLIC_USE_LIVEKIT=false`
   - Restart web service
   - Verify Mediasoup functionality

2. **Docker Rollback**
   - Stop all services: `./docker-stop.sh`
   - Revert to previous Docker configuration
   - Restart services

3. **Code Rollback**
   - Revert to previous git commit
   - Rebuild and restart services

## Success Criteria

The migration is considered successful when:

- [ ] All Phase 1 tests pass (Docker infrastructure)
- [ ] All Phase 2 tests pass (Mediasoup functionality)
- [ ] All Phase 3 tests pass (LiveKit functionality)
- [ ] Performance is comparable or better than Mediasoup
- [ ] No critical bugs are found
- [ ] User experience is maintained or improved
- [ ] All security requirements are met

## Reporting

After testing completion, create a report including:

1. **Test Results Summary**
   - Number of tests passed/failed
   - Critical issues found
   - Performance metrics

2. **Recommendations**
   - Whether to proceed with migration
   - Any required fixes
   - Additional testing needed

3. **Next Steps**
   - Timeline for fixes
   - Production deployment plan
   - Monitoring strategy
