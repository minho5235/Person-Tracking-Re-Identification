import numpy as np
import cv2

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
            """if sharpness > max_sharpness:
                max_sharpness = sharpness
                sharpest_image = image_array"""
        except Exception as e:
            print(f"이미지 처리 오류: {e}")
        sharpest_image_sorted = sorted(sharpest_image, key=lambda x: x[1])
    return sharpest_image_sorted


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
        self.person = []
        self.face_image = []
        self.frame_count = []
        self.exist = []
        self.namelist = []
        self.images_counts = []
        self.image_folders = []
        self.video = None
        self.video_count = None


    def add_face_encoding(self, face):
        self.faces.append(face)
        
    def add_face_image(self, face_image):
        self.face_image.append(face_image)

    def add_image(self, image):
        self.images.append(image)
    
    def add_person(self, frame):
        self.person.append(frame)

    def get_image(self, index):
        return self.images[index]
    
    def get_face_count(self):
        return len(self.faces)

    def calculate_average_encoding(self):
        if len(self.faces) == 0:
            self.encoding = None
        else:
            self.encoding = np.average(self.faces, axis=0)
        return self.encoding
        
        # 프레임 리스트로부터 비디오 생성
    def make_vidio(self, vidio_name):
        frame_list = []
        frame_list.append(self.images[0])
        for i in range(1, len(self.images)-1):
            if np.all(self.images[i] <= frame_list[-1][-1] + 60):
                frame_list[-1] = np.concatenate((frame_list[-1], self.images[i]), axis=0)
            else:
                frame_list.append(self.images[i])

        # 비디오 속성 설정
        frame_width = frame_list[0].shape[1]
        frame_height = frame_list[0].shape[0]
        fps = 30.0

        # 비디오라이터 생성
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(vidio_name, fourcc, fps, (frame_width, frame_height))

        # 각 프레임을 비디오에 쓰기
        for frame in frame_list:
            video_writer.write(frame)

        # 비디오 라이터 해제
        video_writer.release()
