import React, { Component } from 'react';

interface Props {
    handleClickSignUpButton(event: any): void;
    handleClickSignInButton(event: any): void;
}

class Overlay extends Component<Props> {
    render() {
        const { handleClickSignUpButton, handleClickSignInButton } = this.props;
        return (
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <p style={{color: 'white', fontSize: '35px'}}>Welcome Back!</p>
                        <p className="overlay-description">
                            이미 가입한 회원이시라면,<br/>
                            로그인 후 더 많은 서비스를<br/>이용할 수 있습니다.
                        </p>
                        <button style={{paddingTop:'15px'}}
                            className="ghost form-button"
                            id="signIn"
                            onClick={handleClickSignInButton}
                        >LOGIN</button>
                    </div>

                    
                    <div className="overlay-panel overlay-right">
                        <h1 style={{color: 'white', fontSize: '35px'}}>Hello, Friend!</h1>
                        <p className="overlay-description">
                            아직 회원이 아니시라면,<br/>
                            가입 후 더 많은 서비스를 이용할 수 있습니다.
                        </p>
                        <button style={{paddingTop:'15px'}}
                            className="ghost form-button"
                            id="signUp"
                            onClick={handleClickSignUpButton}
                        >Sign Up</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Overlay;