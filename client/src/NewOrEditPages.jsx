import { useParams , useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Card, CardGroup, Row, Form, Col, Modal, Alert } from 'react-bootstrap';
import { listAllBlocks, updateBlocks, addBlocks, deleteBlocks, updatePage, addPage } from "./API";
import img1 from '../images/img1.jpg'
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import img4 from '../images/img4.jpg';
import { Block } from './model';
import dayjs from "dayjs";
import {Page} from "./model.js"
import { useContext } from "react";
import { UserContext } from "./UserContext";


const imageMap = {
  img1: img1,
  img2: img2,
  img3: img3,
  img4: img4,
};

function NewOrEditPages(props) {
const {pageId} = useParams() ;

const user = useContext(UserContext);

const [blocks, setBlocks] = useState([]);
const [showModal, setShowModal] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [hoveredImage, setHoveredImage] = useState(null);
const [originalBlocks, setOriginalBlocks] = useState([]);

const [pageTitle, setPageTitle] = useState("") ;
const [publicationDate, setPublicationDate] = useState("") ;
const [creationDate, setCreationDate] = useState ("")
const [author, setAuthor] = useState(user.username) 
const [errMsg, setErrMsg] = useState('');

const navigate = useNavigate() ;

const deletedElements = [];
const newElements = [];
const oldElements=[];

const countTypes = () => {
  let n_headers = 0;
  let n_extras = 0;
  blocks.forEach(element => {
      if (element.type == "header" || element.type == "Header") {
          n_headers += 1;
      }
      else if (element.type == "paragraph" || element.type == "Paragraph" || element.type == 'image' || element.type == 'Image') {
          n_extras += 1;
      }
  });
  if (n_headers == 0 || n_extras == 0) {
      return false;
  }
  else {
      return true;
    }
};

const checkFilling = () => {
  let flag = true;
  blocks.forEach((block) => {
    if (block.content.length == 0) {
        flag = false;
    }
  })
  if(pageTitle.trim() == "" || author.trim() == ""){
    flag = false ;
  }
  return flag;
}

useEffect(() => {
  if (typeof pageId !== 'undefined') {
    const myPage = props.pages.find((p) => p.pageId == pageId);
    if (myPage) {
      setPageTitle(myPage.title);
      setPublicationDate(myPage.publicationDate);
      setCreationDate(myPage.creationDate) ;
      setAuthor(myPage.author);
    }
    listAllBlocks(pageId).then((result) => {
      setBlocks(result.sort((a, b) => a.position - b.position));
      setOriginalBlocks(result); // Update originalBlocks with the new value of blocks
    });
  }
}, [pageId, props.pages]);


useEffect(() => {
  if (errMsg) {
      setTimeout(() => { setErrMsg('') }, 4000);
  }
},[errMsg]);


const handleCancel = () => {
  if (pageId) {
      navigate(`/blocks/${pageId}`);
  } else {
      navigate("..");
}}

  const handleSwap = (blockA, val) => {
    const sorted = [...blocks];
    const index = sorted.indexOf(blockA);
    if ((index === 0 && val === -1) || (index === sorted.length - 1 && val === 1)) {
    } else {
      [sorted[index], sorted[index + val]] = [sorted[index + val], sorted[index]];
    }
    setBlocks(sorted);
  };

  const handleContentChange = (blockId, newContent) => {
    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.map((block) => {
        if (block.blockId === blockId) {
          return {
            ...block,
            content: newContent,
          };
        }
        return block;
      });
      return updatedBlocks;
    });
  };

  const handleNewHeader = () => {
    const updated = [...blocks];
    const maxBlockId = updated.reduce((maxId, obj) => {
      return obj.blockId > maxId ? obj.blockId : maxId;
    }, 0);
    const newHeader = new Block(maxBlockId + 1, "", updated.length, pageId, "header", 1);
    updated.push(newHeader);
    setBlocks(updated);
  };

  const handleNewParagraph = () => {
    const updated = [...blocks];
    const maxBlockId = updated.reduce((maxId, obj) => {
      return obj.blockId > maxId ? obj.blockId : maxId;
    }, 0);
    const newParagraph = new Block(maxBlockId + 1, "", updated.length, pageId, "paragraph", 1);
    updated.push(newParagraph);
    setBlocks(updated);
  };

  const handleNewImage = () => {
    setShowModal(true);
  };

  const handleImageSelect = (imageKey) => {
    setSelectedImage(imageKey);
  };
  

  const handleAddImage = () => {
    if (selectedImage) {
      console.log(selectedImage);
      const updated = [...blocks];
      const maxBlockId = updated.reduce((maxId, obj) => {
        return obj.blockId > maxId ? obj.blockId : maxId;
      }, 0);
      const newImage = new Block(maxBlockId + 1, selectedImage, updated.length, pageId, "image", 1);
      updated.push(newImage);
      setBlocks(updated);
      setShowModal(false);
      setSelectedImage(null);
    }
  };

  const handleDelete = (block) => {
    const updated = [...blocks];
    updated.splice(updated.indexOf(block), 1);
    setBlocks(updated);
  }

  const handleSave = async () => {
   
    if (countTypes() == true && checkFilling() == true) {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].position = i;
        }

        //I look for new blocks and old blocks
        blocks.forEach((block) => {
            const matchingBlock = originalBlocks.find((b) => b.blockId === block.blockId);
            //If I can't find the block is new
            if (!matchingBlock) {
                newElements.push(block);
            } else {
                oldElements.push(block);
            }
        });

        // removed blocks
        originalBlocks.forEach((block) => {
            const matchingBlock = blocks.find((b) => b.blockId == block.blockId);
            if (!matchingBlock) {
                deletedElements.push(block);
            }
        })
      try {
        if (originalBlocks.length == 0) {
          const pubDate = publicationDate ? publicationDate : "";
          const newPageId = await addPage(1, pageTitle, author, dayjs(), pubDate);
          for (const element of newElements) {
            element.pageId = newPageId;
          }
          props.setPages((prevPages)=>{
            const newList = [...prevPages];
            console.log(publicationDate) ;
            const newP = new Page(newPageId,pageTitle , author, 1 , dayjs(), publicationDate);
            newList.push(newP);
            return newList;
          });
          addBlocks(newElements);
        }
        else {
          props.setPages((prevPages)=>{
            let newList = [...prevPages];
            const newP = new Page(Number(pageId), pageTitle   , author, 1, creationDate, publicationDate);
            newList = newList.filter(page => page.pageId !== Number(pageId));
            newList.push(newP);
            return newList;
          });

          updatePage(pageId, pageTitle, author, publicationDate);
          deleteBlocks(deletedElements);
          updateBlocks(oldElements);
          addBlocks(newElements);
        }
        
      }
      catch (error) {
        throw new Error(error.message, { cause: error });
      }
        navigate('/');
    } else {
        setErrMsg("The Page must have a valid title, at least an header and at least one between a paragraph and an image");
    }
}

return (
    <div className="page-container text-center">
      <Form.Group controlId="formPageTitle">
        <Form.Label>Page Title:</Form.Label>
        <Form.Control
          type="text"
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          placeholder="Enter page title"
        />
      </Form.Group>
      <Form.Group controlId="formPublicationDate">
        <Form.Label>Publication Date:</Form.Label>
        <Form.Control
          type="date"
          value={publicationDate ? publicationDate : "" }
          onChange={(e) => setPublicationDate(e.target.value)}
          placeholder="Enter publication date"
        />
      </Form.Group>
      <Form.Group controlId="formAuthor">
        <Form.Label>Author:</Form.Label>
        {user.type === "admin" ? (
          <Form.Control
            as="select"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          >
            <option value="" disabled hidden>
              Select an author
            </option>
          {props.realUsers.map((user) => (
          <option key={user.username} value={user.username}>
            {user.username}
          </option>
          ))}
    </Form.Control>
      ) : (
      <Form.Control
        type="text"
        value={user.username}
        readOnly
        className="non-admin-field"
        title="You need to be an admin to change this"
        style={{ cursor: "not-allowed", borderBottom: "1px dotted #ccc" }}
      />
     )}
    </Form.Group>
       <p> </p>
      <div className="blocks-container">
        {blocks.map((block) => (
          <div key={block.blockId} className="block-item">
            <Row className="block-row">
              <Form.Group controlId={`formControl-${block.blockId}`}>
                <div className="debugging">
                  <Form.Label className="block-label text-center">
                    {block.type === 'header' && 'Header'}
                    {block.type === 'paragraph' && 'Paragraph'}
                    {block.type === 'image' && 'Image'}
                  </Form.Label>
                  <Row>
                    <Col md={2} />
                    <Col md={7}>
                      {block.type === 'image' ? (
                        <div className={`image-container ${selectedImage === block.content ? "selected" : ""}`}>
                          <img src={imageMap[block.content]} alt="Block Image" className="block-image" />
                        </div>
                      ) : (
                        <Form.Control
                          value={block.content}
                          onChange={(e) => handleContentChange(block.blockId, e.target.value)}
                          type="text"
                          name="content"
                          placeholder="insert text"
                          className="content-input"
                        />
                      )}
                    </Col>
                    <Col md={1} />
                    <Col md={2}>
                      <div className="button-container-1">
                        <Button variant="secondary" onClick={() => handleSwap(block, -1)}>UP</Button>
                        <Button variant="danger" onClick={()=> handleDelete(block)}>DELETE</Button>
                        <Button variant="secondary" onClick={() => handleSwap(block, 1)}>DOWN</Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Form.Group>
            </Row>
          </div>
        ))}
        <p> </p>
      </div>
      <div className="button-containernew">
        <Button variant="primary" onClick={handleNewHeader} className="custom-button">NEW HEADER</Button>
        <Button variant="primary" onClick={handleNewParagraph} className="custom-button">NEW PARAGRAPH</Button>
        <Button variant="primary" onClick={handleNewImage} className="custom-button">NEW IMAGE</Button>
      </div>
      {errMsg && <Alert variant="danger">{errMsg}</Alert>}
      <div className="button-container">
        <Button variant="success" onClick={handleSave} className="custom-button-save">SAVE</Button>
        <Button variant="danger" onClick={handleCancel} className="custom-button-delete">CANCEL</Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select an Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="image-options">
            {Object.keys(imageMap).map((imageKey) => (
              <img
                key={imageKey}
                src={imageMap[imageKey]}
                alt={`Image ${imageKey}`}
                className={`image-option ${selectedImage === imageKey ? "selected" : ""} ${hoveredImage === imageKey ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredImage(imageKey)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageSelect(imageKey)}
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddImage}>Add Image</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export { NewOrEditPages };
