import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Watch = () => {
  const { recordingId } = useParams();

  return (
    <>
      <section className="container py-4">
        <h1 className="mb-4">Watch Streams</h1>
        <p className="lead">
          This page is under construction. Please check back later!
        </p>
        <video className="w-100" controls>
          <source src={`/api/watch/${recordingId}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>
    </>
  );
};

export default Watch;
