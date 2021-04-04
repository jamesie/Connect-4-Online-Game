import React, { useEffect, useState } from "react";
import styles from "../pages/game/gamePage.module.css";

interface PiecesAndButtonsProps {
  playerColor: string;
}

const PiecesAndButtons: React.FC<PiecesAndButtonsProps> = ({ playerColor }) => {
  const [hover, handleHover] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const [pieces, setPieces] = useState([<></>]);

  const buttons = (): JSX.Element[] | null => {
    let arr = [];
    for (let i = 0; i < 7; i++) {
      arr.push(
        <button
          onClick={() => {
            let newArr = [];
            pieces.forEach((piece, index) => {
              if (index === i) {
                console.log(piece)
                newArr.push(
                  <img
                    src={`../../../static/${playerColor}-piece.svg`}
                    alt={`${"yellow"}_piece.svg`}
                    className={styles.pieceDown1}
                    onClick={() => {}}
                    style={{
                      opacity: 100,
                      gridColumn: index + 1,
                      display: "flex",
                    }}
                    key={index + "img"}
                    
                  />
                );
                handleHover({
                  ...hover,
                  [i]: null,
                });
              } else {
                newArr.push(pieces[index]);
              }

              
            });
            setPieces(newArr)
          }}
          onMouseEnter={(e) => {
            for (let i = 0; i < 7; i++) {
              if (hover[i] === true && hover[i] !== parseInt(e.target.name)) {
                handleHover({
                  ...hover,
                  [i]: false,
                  [parseInt(e.target.name)]: true,
                });
                console.log("returning");
                return;
              }
            }
            handleHover({
              ...hover,
              [parseInt(e.target.name)]: true,
            });
          }}
          key={i}
          name={String(i)}
          onMouseLeave={(e) => {
            handleHover({
              ...hover,
              [parseInt(e.target.name)]: false,
            });
          }}
          style={{ gridColumn: i + 1 }}
          className={styles.button}
        >
          column {i}
        </button>
      );
    }
    return arr;
  };

  useEffect(() => {
    var jsxArr = [];
    for (let index = 0; index < 7; index++) {
      if (hover[index] === true || hover[index] === null) {
        jsxArr.push(
          <img
            src={`../../../static/${playerColor}-piece.svg`}
            alt={`${playerColor}_piece.svg`}
            className={styles.piece}
            onClick={() => {}}
            style={{
              opacity: 100,
              gridColumn: index + 1,
              display: "flex",
            }}
            key={index + "img"}
          />
        );
      } else {
        jsxArr.push(<></>);
      }
    }
    setPieces(jsxArr);
  }, [hover]);

  return (
    <>
      <div className={styles.gridPos}>
        <div className={styles.boardGrid}>
          {pieces} {buttons()}
        </div>
      </div>
    </>
  );
};

export default PiecesAndButtons;
