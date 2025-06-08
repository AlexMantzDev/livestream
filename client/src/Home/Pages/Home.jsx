import React, { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [live, setLive] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        const [responseLive, responsePast] = await Promise.all([
          axios.get("/api/recordings/live/"),
          axios.get("/api/recordings/"),
        ]);

        console.log("Live Streams:", responseLive.data);
        console.log("Past Streams:", responsePast.data);

        setLive(responseLive.data);
        setPast(responsePast.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching streams:", error);
      }
    };

    fetchStreams();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <h2>Loading...</h2>
        </div>
      )}
      {!isLoading && (
        <>
          <section className="container py-4">
            <h1 className="mb-4">Live Streams</h1>

            {live.length === 0 ? (
              <div className="alert alert-info">
                No streams available right now.
              </div>
            ) : (
              <div className="row">
                {live.map((stream) => (
                  <div key={stream._id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{stream.title}</h5>
                        <p className="card-text">{stream.description}</p>
                        <a
                          href={`/watch/${stream._id}`}
                          className="btn btn-primary"
                        >
                          Watch Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="container py-4">
            <h2 className="mb-4">Past Streams</h2>

            {past.length === 0 && (
              <div className="alert alert-info">No past streams available.</div>
            )}
            {past.length > 0 && (
              <div className="row">
                {past.map((vod) => (
                  <div key={vod._id} className="col-md-4 mb-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{vod.title}</h5>
                        <p className="card-text">{vod.description}</p>
                        <a
                          href={`/watch/${vod._id}`}
                          className="btn btn-secondary"
                        >
                          Watch Recording
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
};

export default HomePage;
