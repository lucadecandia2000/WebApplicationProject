import { Link, useParams, useNavigate } from "react-router-dom";
import { Button, Card, CardGroup, Row } from 'react-bootstrap';
import {listAllBlocks, deletePage, deleteBlocks} from './API' ;  
import {useState, useEffect} from 'react' ; 
import img1 from '../images/img1.jpg'
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import img4 from '../images/img4.jpg';
import { useContext } from "react";
import { UserContext } from "./UserContext";


const imageMap = {
    img1: img1,
    img2: img2,
    img3: img3,
    img4: img4,
  };


function BlockList(props) {
    const user = useContext(UserContext);

    const navigate = useNavigate() ; 
    const {pageId} = useParams() ; 
    const [blocks, setBlocks] = useState([]) ; 

    useEffect(() => {
        listAllBlocks(pageId).then(blocks => {
            setBlocks(blocks) ; 
        }) 
      }, [pageId]);

      const myPage = props.pages.find((p) => p.pageId ==pageId);
    
    const handleBack = () => {
        navigate('/') ; 
    }

    const handleDelete = async () => {
      try {
        const deletedBlocks = blocks.filter((b) => b.pageId === myPage.pageId);
        await deleteBlocks(deletedBlocks);
        await deletePage(pageId);
        // Frontend visualization
        props.setPages(prevPages => prevPages.filter(page => page.pageId !== myPage.pageId));
        navigate('/');
      } catch (error) {
        throw new Error(error.message, { cause: error });
      }
    };

    return (
      <div className="page-container">
        <h1 className="page-title">{myPage.title}</h1>
        {blocks
          .sort((a, b) => a.position - b.position)
          .map((block) => (
            <div key={block.blockId} className="block-item">
              <Row className="block-row">
                {block.type === 'header' && <h2 className="block-header">{block.content}</h2>}
                {block.type === 'paragraph' && <p className="block-paragraph">{block.content}</p>}
                {block.type === 'image' && (
                  <img className="block-image" src={imageMap[block.content]} alt="Block Image" />
                )}
              </Row>
            </div>
          ))}
        {user.type === 'admin' || myPage.author === user.username ? (
          <div className="admin-buttons">
            <Button variant="primary" className="edit-button"href={`/editPage/${pageId}`}>EDIT</Button>
            <Button variant="danger" className="delete-button" onClick={handleDelete}>DELETE</Button>
          </div>
        ) : null}
        <Button className="back-button" onClick={handleBack}>GET BACK</Button>
      </div>
    );      
}

export { BlockList };