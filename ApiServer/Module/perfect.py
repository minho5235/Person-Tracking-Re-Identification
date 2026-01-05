import numpy as np
import cv2
import face_recognition
import os
from collections import Counter
import json
import Module.detect_and_track1
import Module.detect_and_track2
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from multiprocessing import Pool

known_face_encodings = []
known_face_names = []
yousado = 0.39
threshold = 0.89

image_name_dic = { "minho" : "한민호", "jongwon" : "박종원", "hoehun" : "김회훈"}

people = []
people1 = []
people2 = []

class Person():
    _last_id = 0
    def __init__(self, name=None):
        if name is None:
            Person._last_id += 1
            self.name = "person_%02d" % Person._last_id
        else:
            self.name = name
            if name.startswith("person_") and name[7:].isdigit():
                id = int(name[7:])
                if id > Person._last_id:
                    Person._last_id = id
        self.encoding = None
        self.faces = []
        self.images = []
        self.frames = []
        self.namelist = []        
        self.images_counts = []
        self.image_folders = []  # 추가된 부분: 이미지별로 가장 많이 등장한 폴더명을 저장하는 리스트
        self.exist = []
        self.frame_count = []

        self.addframe = False
        
    def add_image_folder(self, folder_name):
        self.image_folders.append(folder_name)

    def add_image_counts(self, count):
        self.images_counts.append(count)
        

    def add_face(self, face):
        if len(self.faces) <= len(self.images):
            self.faces.append(face)
        else:
            self.faces[-1] = face

    def add_image(self, image):
        if len(self.images) < 500:
            self.images.append(image)
    
    def add_frame(self, frame):
        self.frames.append(frame)
        self.addframe = True

    def get_image(self, index):
        return self.images[index]
    
    def get_face_count(self):
        return len(self.faces)
    
    def get_addframe(self):
        return self.addframe
    
    def set_addframe(self, bool):
        self.addframe = bool

    def calculate_average_encoding(self):
        if len(self.faces) == 0:
            self.encoding = None
        else:
            self.encoding = np.average(self.faces, axis=0)
        return self.encoding
        
# 이미지 저장 함수
def save_face_image(face_image, face_id):
    cv2.imwrite(f'{face_id}', face_image)

def exist_second(person):
    start_p = -1000
    end_p = -1000
    for i in range(0, len(person.frame_count)):
        if person.frame_count[i] > end_p + 150:
            if i != 0:
                frame_list = [int(start_p/30), int(end_p/30)]
                if end_p - start_p >= 150:
                    person.exist.append(frame_list)
            start_p = person.frame_count[i]
            end_p = person.frame_count[i]
        else:
            end_p = person.frame_count[i]
        if i == len(person.frame_count) - 1:
            frame_list = [int(start_p/30), int(end_p/30)]
            if end_p - start_p >= 150:
                person.exist.append(frame_list)


def load_images_and_encodings():
    global known_face_encodings
    global known_face_names

    dataset_path = os.path.join(os.path.join(os.getcwd(), "Module"),"examface2")

    for person_folder in os.listdir(dataset_path):
        person_folder_path = os.path.join(dataset_path, person_folder)

        if os.path.isdir(person_folder_path):
            for filename in os.listdir(person_folder_path):
                if filename.endswith(".jpg"):
                    image_path = os.path.join(person_folder_path, filename)
                    
                    # 이미지 로드 및 얼굴 인식
                    person_image = face_recognition.load_image_file(image_path)
                    person_face_encodings = face_recognition.face_encodings(person_image)

                    for encoding in person_face_encodings:
                        known_face_encodings.append(encoding)
                        known_face_names.append(person_folder)


def find_sharpest_image(image_arrays):
    max_sharpness = -1
    sharpest_image = []

    for image_array in image_arrays:
        try:
            # 이미지 어레이를 그레이스케일로 변환
            img = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
            sharpness = cv2.Laplacian(img, cv2.CV_64F).var()
            data = [image_array, sharpness]
            sharpest_image.append(data)
        except Exception as e:
            print(f"이미지 처리 오류: {e}")
        sharpest_image_sorted = sorted(sharpest_image, key=lambda x: x[1])
    return sharpest_image_sorted

def recognize_faces_for_person(person_images, known_face_encodings, known_face_names, person, top_n=7):
    global threshold  # 전역 변수로 threshold 사용
    global yousado

    folder_similarity_dict = {}  # 각 폴더의 유사도를 누적하여 저장하는 딕셔너리
    image_folder_names = []  # 각 이미지별로 폴더명을 저장하는 리스트
    folder_counts = {}  # 각 폴더명의 수를 저장하는 딕셔너리

    for person_image in person_images:
        # 이미지 로드 및 얼굴 인식
        unknown_image = face_recognition.load_image_file(person_image)
        face_locations = face_recognition.face_locations(unknown_image)
        
        unknown_face_encodings = face_recognition.face_encodings(unknown_image, face_locations)

        folder_similarity_list = []  # 각 사진별로 폴더명의 유사도를 저장하는 리스트
        image_folder_name = []  # 각 이미지별로 폴더명을 저장하는 리스트

        for unknown_face_encoding, (top, right, bottom, left) in zip(unknown_face_encodings, face_locations):
            # 알려진 얼굴과 비교
            matching_faces = [(known_face_names[i], match) for i, match in enumerate(
                face_recognition.face_distance(known_face_encodings, unknown_face_encoding)) if match <= yousado]

            # 유사도가 낮은 순서로 정렬
            matching_faces.sort(key=lambda x: x[1])

            if matching_faces:
                # 상위 top_n 개의 유사한 얼굴의 정보 가져오기
                top_matching_faces = matching_faces[:top_n]

                print(f"이미지 파일 이름: {os.path.basename(person_image)}")
                print(f"얼굴 위치: 위({top}), 오른쪽({right}), 아래({bottom}), 왼쪽({left})")

                # 첫 번째 얼굴만 선택
                best_match_name, best_match_similarity = top_matching_faces[0]

                print(f"가장 유사한 얼굴 - 폴더명: {best_match_name}, 유사도: {best_match_similarity}")

                # 딕셔너리에 폴더명과 유사도 추가 또는 갱신
                if best_match_name in folder_similarity_dict:
                    folder_similarity_dict[best_match_name].append(best_match_similarity)
                else:
                    folder_similarity_dict[best_match_name] = [best_match_similarity]

                folder_similarity_list.append(best_match_similarity)
                image_folder_name.append(best_match_name)

                # 딕셔너리에 폴더명과 수 추가 또는 갱신
                if best_match_name in folder_counts:
                    folder_counts[best_match_name] += 1
                else:
                    folder_counts[best_match_name] = 1

            else:
                print(f"이미지 파일 이름: {os.path.basename(person_image)}")
                print(
                    f"얼굴 위치: 위({top}), 오른쪽({right}), 아래({bottom}), 왼쪽({left}), 일치하는 얼굴이 없습니다.")
                # 이미지별로 얼굴이 인식되지 않은 경우 "noface" 추가
                folder_similarity_list.append(0.0)  # 유사도가 0.0인 가상의 값을 추가
                image_folder_name.append("noface")

        # 이미지별로 폴더명의 평균 유사도 계산
        if folder_similarity_list:
            image_avg_similarity = sum(folder_similarity_list) / len(folder_similarity_list)
            print(f"{os.path.basename(person_image)}의 폴더명 평균 유사도: {image_avg_similarity}")

            most_common_image_folder_name = Counter(image_folder_name).most_common(1)[0][0]
            print(f"{os.path.basename(person_image)}의 폴더명: {most_common_image_folder_name}")
            image_folder_names.append(most_common_image_folder_name)  # 가장 많이 등장한 폴더명 추가

            person.namelist.append(most_common_image_folder_name)
        else:
            print(f"{os.path.basename(person_image)}의 폴더명 평균 유사도: 얼굴이 인식되지 않음")
            most_common_image_folder_name = "noface"  # 얼굴이 인식되지 않은 경우 "noface" 추가
            image_folder_names.append(most_common_image_folder_name)

            person.namelist.append(most_common_image_folder_name)

    # 전체 이미지 수
    total_images = len(person_images)

    # 'noface' 이미지 수 계산
    noface_count = image_folder_names.count('noface')

    # 'noface' 비율 계산
    noface_ratio = noface_count / total_images

    # 'noface' 비율이 threshold 이상인 경우 'noface' 출력, 그렇지 않으면 두 번째로 많이 나온 폴더명 출력
    if noface_ratio >= threshold or all(count == 1 for count in folder_counts.values()):
        most_common_folder = 'noface'
    else:
        # 두 번째로 많이 나온 폴더명 계산
        # 'noface'가 folder_counts에 있는 경우에만 삭제
        if 'noface' in folder_counts:
            del folder_counts['noface']  # 'noface'는 제외하고 계산
        most_common_folder = max(folder_counts, key=folder_counts.get)

    print(f"\n가장 많이 등장한 폴더: {most_common_folder}")

    # 이미지 개수도 함께 반환
    return most_common_folder, folder_counts.get(most_common_folder, 0)

def process_and_save_images(person, count_people, most_common_folder, output_path):
    indexlist = []
    imagelist = []
    incodinglist = []
    global image_name_dic
    for i in range(len(person.namelist)):
        if person.namelist[i] == most_common_folder:
            indexlist.append(i)

    for i in range(len(person.namelist)):
        if person.namelist[i] == most_common_folder:
            indexlist.append(i)

    for i in indexlist:
        imagelist.append(person.face_image[i])
        incodinglist.append(person.faces[i])
    
    person.face_image = imagelist  
    person.faces = incodinglist

    count_image = 0
    for i in range(len(person.face_image)):
        save_path = f"person{count_people}_{count_image}_{most_common_folder}.jpg"
        save_face_image(person.face_image[i], save_path)
        count_image += 1

    person_distance = []
    for i in range(len(person.face_image)):
        person_distance.append(0)
        for j in range(len(person.face_image)):
            if i == j:
                continue
            else:
                distance = face_recognition.face_distance([person.faces[i]], person.faces[j])
                person_distance[i] += distance[0]

    near_distance = 100
    near_index = 1
    for i in range(len(person_distance)):
        if near_distance > person_distance[i]:
            near_distance = person_distance[i]
            near_index = i

    #sharpest_image = find_sharpest_image(person.face_image)    
    sharpest_image_person = find_sharpest_image(person.person)

    real_path = output_path
    folder_path = os.path.join(real_path, f"{count_people}_{most_common_folder}")

    # 이미지를 저장할 폴더가 존재하지 않으면 새로운 폴더를 생성합니다
    os.makedirs(folder_path, exist_ok=True)
    
    sharp_image_count = 0
    
    for sharpest_image_person_sorted in sharpest_image_person:
        if sharp_image_count >= 40:
            break 
        save_face_image(sharpest_image_person_sorted[0], os.path.join(folder_path, f"{count_people}_{most_common_folder}_{sharp_image_count}_person.jpg"))
        sharp_image_count += 1
    
    folder_path = os.getcwd()

    # 해당 디렉토리 내의 모든 파일 삭제
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        # 파일이 이미지인 경우에만 삭제
        if os.path.isfile(file_path) and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            try:
                os.remove(file_path)
                print(f"{filename} 삭제 완료")
            except Exception as e:
                print(f"{filename} 삭제 중 오류 발생: {e}")                

def addpeople(people1, people2):
    global people
    for i in range(0, len(people1)):
        index = []
        for j in range(0, len(people2)):
            person_avg1 = people1[i].calculate_average_encoding()
            person_avg2 = people2[j].calculate_average_encoding()
            distance = face_recognition.face_distance([person_avg1], person_avg2)
            if distance[0] <= 0.355:
                index.append(j)
                people1[i].exist.extend(people2[j].exist)
        for k in reversed(index):
            people2.pop(k)
    people1.extend(people2)
    people = people1

def process_video1(video_path):
    people1 = Module.detect_and_track1.tracking(video_path)
    return people1

def process_video2(video_path):
    people2 = Module.detect_and_track2.tracking(video_path)
    return people2

def process_people_and_save_images(video_path, output_path):
    global known_face_encodings
    global known_face_names
    global people
        
    with Pool(2) as pool:
        result1= pool.apply_async(process_video1, (video_path,))
        result2 = pool.apply_async(process_video2, (video_path,))

        # 결과 가져오기
        res1 = result1.get()
        res2 = result2.get()
    pool.close()
    pool.join()
        
    addpeople(res1, res2)

    count_people = 1
    for person in people:
        data = []
        for time1 in person.exist:
            value = {}
            value["start"] = str(time1[0])
            value["end"] = str(time1[1])
            data.append(value)
        image_paths = []
        count_image = 0
        # 이미지를 저장하고 경로를 가져오는 부분
        for person_image in person.face_image:
            if count_image >= 40:
                break
            save_path = f"person{count_people}_{count_image}.jpg"
            save_face_image(person_image, save_path)
            image_paths.append(save_path)
            count_image += 1

        most_common_folder, folder_count = recognize_faces_for_person(image_paths, known_face_encodings, known_face_names, person, top_n=7)
        person.name = most_common_folder
        person.image_count = folder_count
        print(f"person_{count_people}={person.name} -전체이미지({len(person.face_image)}) -가장많이나온이름'{person.name}'의 수: {person.image_count}")

        # 이미지 처리 및 저장 부분을 함수로 호출
        process_and_save_images(person, count_people, most_common_folder, output_path)
        first_path = os.path.join(output_path, f"{count_people}_{most_common_folder}")
        
        with open(os.path.join(first_path,"data.json"), "w") as json_file:
            json.dump(data, json_file)

        new_folder_name = image_name_dic.get(most_common_folder)        
        if new_folder_name:
            new_path = os.path.join(output_path, f"{count_people}_{new_folder_name}")

            # 폴더 이름 변경
            try:
                os.rename(first_path, new_path)
                print(f"Debug: 폴더 이름 변경 - {first_path}에서 {new_path}")
            except Exception as e:
                print(f"폴더 이름 변경 중 오류 발생: {e}")
        
        count_people += 1
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f"{output_path}\\thumbnail.jpg", frame)
    cap.release()

# 사용예시 
# import perfect
# dataset_path = r"C:\Users\user\Desktop\git forder\examface2"  # 데이터셋 폴더 경로에 맞게 변경
# video_path = r"D:\facemovie\트와이스\선미 열이올라요 Challenge ❤️‍🔥⬆️ with 트와이스 나연🐰🍭.mp4"    # 동영상 경로
# output_path = r"C:\Users\user\Desktop\11"                     # 현재py.폴더경로

# perfect.process_people_and_save_images(dataset_path, video_path, output_path)