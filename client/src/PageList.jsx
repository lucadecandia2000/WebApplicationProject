import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import dayjs from "dayjs";
import { UserContext } from "./UserContext";


function PageList(props) {
  const user = useContext(UserContext);
  const [sortedPages, setSortedPages] = useState([]);

  useEffect(() => {
    const sortPages = () => {
      const notDraft = props.pages
        .filter((p) => p.publicationDate !== "Invalid Date")
        .sort((a, b) => dayjs(a.publicationDate).diff(dayjs(b.publicationDate)));
      const draft = props.pages.filter((p) => p.publicationDate === "Invalid Date");
      const concatenated = notDraft.concat(draft);
      setSortedPages(concatenated);
    };

    sortPages();
  }, [props.pages]);

  const getBorderColor = (publicationDate) => {
    if (publicationDate === "Invalid Date") {
      return "#FFCCCC"; // Lighter shade of red
    } else if (publicationDate > dayjs().format("YYYY-MM-DD")) {
      return "#FFFFCC"; // Lighter shade of yellow
    } else {
      return "#CCFFCC"; // Lighter shade of green
    }
  };
  

  return (
    <div className="page-list-container">
        <div className="page-list-header">
            <h2 className="page-list-title">Page List</h2>
        </div>
        <div className="page-card-group">
          {sortedPages.map((p, index) => (
            <div
              key={p.pageId}
              className="page-card"
              style={{ borderColor: getBorderColor(p.publicationDate) }}
            >
            <Card>
              <Card.Body style={{ backgroundColor: getBorderColor(p.publicationDate)  }}>
                <Card.Title>{p.title}</Card.Title>
                <Card.Subtitle>CREATED BY "{p.author}" </Card.Subtitle>
                {p.publicationDate === "Invalid Date" ? (
                  <Card.Subtitle className="draft">DRAFT</Card.Subtitle>
                ) : p.publicationDate > dayjs().format("YYYY-MM-DD") ? (
                  <Card.Subtitle className="future">SCHEDULED FOR "{p.publicationDate}"</Card.Subtitle>
                ) : (
                  <Card.Subtitle className="published">PUBLISHED ON "{p.publicationDate}"</Card.Subtitle>
                )}
                <Card.Subtitle className="created">CREATED ON "{p.creationDate}" </Card.Subtitle>
              </Card.Body>
              <Card.Footer className="card-footer">
                <Link to={`/blocks/${p.pageId}`} className="page-link">
                    OPEN
                </Link>
                </Card.Footer>

            </Card>
          </div>
        ))}
      </div>
      {user.userId && (
        <Button href={"/addPage"} className="add-page-button" >
          ADD PAGE
        </Button>
      )}
    </div>
  );
}

export { PageList };
