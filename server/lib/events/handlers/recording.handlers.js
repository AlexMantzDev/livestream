export const registerRecordingHandlers = (eventBus) => {
  eventBus.on("recording.start", ({ recordingId, userId, startedAt }) => {
    console.log(
      `recording started: ${recordingId} by user ${userId} at ${startedAt}`
    );
  });

  eventBus.on("recording.end", ({ recordingId, userId, endedAt }) => {
    console.log(
      `recording ended: ${recordingId} by user ${userId} at ${endedAt}`
    );
  });
};
