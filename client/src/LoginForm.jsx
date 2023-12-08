import { useState, useEffect } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {

    const [username, setUsername] = useState('') ;
    const [password, setPassword] = useState('') ;
    const [errMsg, setErrMsg] = useState('') ;

    const navigate = useNavigate() ;

    const handleSubmit = async () => {
        try {
            setErrMsg('') ;
            await props.validateLogin(username, password) ;
            navigate('/') ;
        } catch(err) {
            setErrMsg(err.message) ;
        }
    }

    useEffect(()=>{
        if(errMsg) {
            setTimeout(()=>{setErrMsg('')}, 3000);
        }
    }, [errMsg]);

    return (
        <Form className="login-form">
          <Form.Group className="mb-3">
            <Form.Label className="form-label custom-label">Username</Form.Label>
            <Form.Control
              type="username"
              placeholder="Username"
              value={username}
              onChange={(ev) => {
                setUsername(ev.target.value);
              }}
              className="form-control custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="form-label custom-label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
              }}
              className="form-control custom-input"
            />
          </Form.Group>
          <Button variant="primary" type="button" onClick={handleSubmit} className="custom-button">
            Submit
          </Button>{" "}
          <Button variant="secondary" type="button" onClick={() => navigate("/")} className="custom-button">
            Cancel
          </Button>
          <br />
          {errMsg && <Alert variant="danger" className="error-message">{errMsg}</Alert>}
        </Form>
      );

}

export{LoginForm};