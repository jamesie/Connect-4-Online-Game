import React from "react";
import styles from "../pages/game/gamePage.module.css";

interface PermPieceProps {
  downTo: number;
  color: string;
  columnplus1: number;
}

const PermPiece: React.FC<PermPieceProps> = ({ downTo, color, columnplus1 }) => {
  return (
    <>
      <img
        src={`../../../static/${color}-piece.svg`}
        alt={`${"yellow"}_piece.svg`}
        className={styles.pieceDown1}
        onClick={() => {}}
        style={{
          opacity: 100,
          gridColumn: columnplus1,
          display: "flex",
        }}
        key={(columnplus1 - 1) + "perm piece"}
      />
    </>
  );
};

export default PermPiece;
