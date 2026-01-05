import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv


load_dotenv()
# 이메일 로그인 계정 입력
SENDER =  os.getenv("EMAIL_ID")
PASSWORD = os.getenv("EMAIL_PW")

#제목
TitleMsg_JOIN = "[더부룩 민주당] 회원가입 안내"
TitleMsg_FindPW = "[더부룩 민주당] 임시 비밀번호 발급 안내"

#내용
def Msg_JOIN(num):
  return str("본인이 맞으시다면 다음 코드를 인증칸에 입력하세요.\n[ "+num+" ]")

def Msg_FindPW(id, pw):
  return str(id + " 님의 임시 비밀번호는 [ "+pw+" ] 입니다.\n 로그인 후 비밀번호를 변경해주세요.")

def smtp_setting(type=None):
  mail_type = None
  port = 587

  if type == 'naver':
    mail_type = 'smtp.naver.com'
  elif type == 'gmail':
    mail_type = 'smtp.gmail.com'
  else:
    mail_type = 'smtp.naver.com'
    
  # SMTP 세션 생성
  smtp = smtplib.SMTP(mail_type, port)
  smtp.set_debuglevel(True)

  # SMTP 계정 인증 설정
  smtp.ehlo()
  smtp.starttls() # TLS 사용시 호출
  smtp.login(SENDER, PASSWORD) # 로그인

  return smtp

def send_mail_join(receiver, num):
  try:
    # SMTP 세션 생성
    smtp = smtp_setting('gmail')

    # 이메일 데이터 설정
    text = Msg_JOIN(num)
    msg = MIMEText(text)
    msg['Subject'] = TitleMsg_JOIN
    msg['From'] = SENDER  # 발신자
    msg['To'] = receiver  # 수신자

    # 메일 전송
    smtp.sendmail(SENDER, receiver, msg.as_string())
  except Exception as e:
    print('error', e)
  finally:
    if smtp is not None:
      smtp.quit()

def send_mail_findPw(receiver, id, pw):
  try:
    # SMTP 세션 생성
    smtp = smtp_setting('gmail')

    # 이메일 데이터 설정
    msg = MIMEText(Msg_FindPW(id, pw))
    msg['Subject'] = TitleMsg_FindPW
    msg['From'] = SENDER  # 발신자
    msg['To'] = receiver  # 수신자

    # 메일 전송
    smtp.sendmail(SENDER, receiver, msg.as_string())
  except Exception as e:
    print('error', e)
  finally:
    if smtp is not None:
      smtp.quit()
