import { Block } from "./model";

const APIURL = 'http://localhost:3000/api';

// Pages

async function listAllPages() {
  try {
    const response = await fetch(APIURL + '/pages',{
      method : "GET",
      credentials: "include",
    });
    if (response.ok) {
      const pages = await response.json();
      return pages;
    } else {
      const msg = await response.text();
      throw new Error(response.statusText + " " + msg);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function listAllPubPages() {
  try {
    const response = await fetch(APIURL + '/PublishedPages',{
      method : "GET",
      credentials: "include",
    });
    if (response.ok) {
      const pages = await response.json();
      return pages;
    } else {
      const msg = await response.text();
      throw new Error(response.statusText + " " + msg);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function updatePage(pageId, title, author, publicationDate) {
  try {
    const response = await fetch(APIURL + `/page/${pageId}/update`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "title": title,
        "author": author,
        "publicationDate": publicationDate
      })
    });
    if (response.ok) {
      return response;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function addPage(userId, title, author, creationDate, publicationDate) {
  try {
    const response = await fetch(APIURL + `/page/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "userId": userId,
        "title": title,
        "author": author,
        "creationDate": creationDate,
        "publicationDate": publicationDate
      })
    });
    if (response.ok) {
      const tmp = Number(await response.text())
      return tmp;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function deletePage(pageId) {
  try {
    const response = await fetch(APIURL + `/page/delete`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "pageId": pageId
      })
    });
    if (response.ok) {
      return true;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

// Blocks

async function listAllBlocks(pageId) {
  try {
    const response = await fetch(APIURL + `/pages/${pageId}/blocks`,{
      method : "GET",
      credentials: "include",
    });
    if (response.ok) {
      const blocks = await response.json();
      return blocks.map(b => new Block(b.blockId, b.content, b.position, b.pageId, b.type, b.pathId));
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function updateBlocks(list) {
  try {
    const response = await fetch(APIURL + `/blocks/update`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "list": list
      })
    });
    if (response.ok) {
      return true;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function addBlocks(list) {
  try {
    const response = await fetch(APIURL + `/blocks/add`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "list": list
      })
    });
    if (response.ok) {
      return true;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function deleteBlocks(list) {
  try {
    const response = await fetch(APIURL + `/blocks/delete`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "list": list
      })
    });
    if (response.ok) {
      return true;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

// Users

async function getUsers() {
  try {
    const response = await fetch(APIURL + '/getAllUsers',{
      method : "GET",
      credentials: "include",
    });
    if (response.ok) {
      const users = await response.json();
      return users;
    } else {
      const msg = await response.text();
      throw new Error(response.statusText + " " + msg);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

// Brand

async function updateTitle(brand) {
  try {
    const response = await fetch(APIURL + `/brand/update`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        "brand": brand
      })
    });
    if (response.ok) {
      return true;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

async function getTitle() {
  try {
    const response = await fetch(APIURL + '/brand/get',{
      method : "GET",
      credentials: "include",
    });
    if (response.ok) {
      const out = await response.json();
      return out;
    } else {
      const message = await response.text();
      throw new Error(response.statusText + " " + message);
    }
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
}

// Login 

async function checkLogin(username, password) {
  try {
      const response = await fetch(APIURL + '/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              username: username,
              password: password
          })
      });
      if (response.ok) {
          // const body = response.json();
          // console.log(body);
          // new User(body.userId,body.username,body.name,body.surname,body.type)
          return response.json();
      } else {
          const message = await response.text();
          throw new Error(/*response.statusText + " " + */message);
      }
  } catch (error) {
      throw new Error(error.message, { cause: error });
  }
}

async function doLogout() {
  try {
      const response = await fetch(APIURL + '/logout', {
          method: 'POST',
      });
      if (response.ok) {
          return true ;
      } else {
          const message = await response.text();
          throw new Error(response.statusText + " " + message);
      }
  } catch (error) {
      throw new Error(error.message, { cause: error });
  }
}

export {
  listAllPages,
  listAllPubPages,
  listAllBlocks,
  deleteBlocks,
  addBlocks,
  updateBlocks,
  deletePage,
  getUsers,
  updatePage,
  addPage,
  getTitle,
  updateTitle,
  checkLogin,
  doLogout
};
