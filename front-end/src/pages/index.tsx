import React, { useRef } from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Paper, TextField, Box } from "@material-ui/core";
import styles from "./index.module.css";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import ReCAPTCHA from "react-google-recaptcha";

interface indexProps {}

const index: React.FC<indexProps> = ({}) => {
  const router = useRouter();
  const reRef= useRef<ReCAPTCHA>();
  const makeUser = gql`
    mutation CreateUser($username: String!) {
      createUser(username: $username) {
        _id
        nickname
      }
    }
  `;

  const [makeUser1, { data }] = useMutation(makeUser);

  return (
    <>
      <div className={styles.gradientBG}>
        <div style={{ display: "grid", placeItems: "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed" }}>
          <div style={{ display: "grid" }}>
            <div style={{ gridRow: 1, marginBottom: "2vh" }}>
              <div className={styles.titlescreen}>Welcome To</div>
              <div className={styles.titlescreen}>ConnectFourOnline.xyz</div>
            </div>
            <div style={{ gridRow: 2, display: "grid"}} className={styles.startGameWrapper}>
              <div className={styles.formText} style={{ gridRow: 1, paddingTop: "20px"}}>
                your nickname:
              </div>
              <input className={styles.nickNameInput} style={{ gridRow: 2, paddingTop: "20px"}} />
              <button className={styles.submitButton} style={{ gridRow: 3}}>Create Game!</button>
            </div>
          </div>
        </div>
      </div>
      <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                ref={reRef}
              />
    </>
  );
};

export default index;
