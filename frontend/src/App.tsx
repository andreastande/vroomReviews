import './App.css';
import { useQuery, useMutation } from '@apollo/client';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Filterpage from './pages/Filterpage';
import Carpage from './pages/Carpage';
import Favoritepage from './pages/Favoritepage';
import Reviewpage from './pages/Reviewpage';
import Header from './components/Header';
import { GET_USER_COUNT } from './graphQL/queries';
import { ADD_USER } from './graphQL/mutations';
import { Spinner } from '@chakra-ui/spinner';
import { useState } from 'react';

function App() {
  const { loading, error, data } = useQuery(GET_USER_COUNT);
  const [addUser] = useMutation(ADD_USER);
  const currentPage = sessionStorage.getItem('currentPage');
  const [page, setPage] = useState(currentPage ? currentPage : 'home');
  const userID = localStorage.getItem('userID');

  if (loading) return <Spinner color="red.500" size="xl" />;
  if (error) console.log(error);

  // Add userID to local storage if it doesn't exist
  if (!userID) {
    addUser({
      variables: {
        userID: data.userCount + 1,
      },
    })
      .then((res) => {
        console.log(res.data.addUser._id);
      })
      .catch((err) => {
        console.log(err);
      });
    localStorage.setItem('userID', data.userCount + 1);
  }

  return (
    <main>
      <div className="App">
        <Header page={page} setPage={setPage} />
        <Routes>
          <Route path="/project2" element={<Homepage />} />
          <Route path="/project2/filtercars" element={<Filterpage />} />
          <Route path="/project2/carpage/:id" element={<Carpage />} />
          <Route
            path="/project2/favorites"
            element={<Favoritepage setPage={setPage} />}
          />
          <Route
            path="/project2/reviewedcars"
            element={<Reviewpage setPage={setPage} />}
          />
        </Routes>
      </div>
    </main>
  );
}

export default App;
