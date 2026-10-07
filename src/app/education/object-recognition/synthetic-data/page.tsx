import { LessonAuthor } from "@/components/education/lesson-author";
import { requireEducationMember } from "@/lib/education/access";
import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/shared";
import { CodeExample } from "@/components/education/code-example";
import { objectRecognitionPath } from "@/lib/education/catalog";
import { perceptionCommands, perceptionSourceCommit } from "@/lib/education/perception-commands";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "합성 데이터로 시작하는 객체인식" };
const assets = "/education-assets/object-recognition";
const source = `https://github.com/YenCho/ddonggae/blob/${perceptionSourceCommit}`;
const repo = "https://github.com/merosnurobotics/meroedu-detection";
function Chapter({ id, title, children }: { id: string; title: string; children: ReactNode }) { return <section id={id} className="perception-chapter"><h2>{title}</h2>{children}</section>; }
function Check({ children }: { children: ReactNode }) { return <details className="education-check"><summary>잠깐 확인하기</summary>{children}</details>; }
function Recipe({ name, label }: { name: keyof typeof perceptionCommands; label: string }) { return <details className="education-recipe"><summary>{label} · 전체 명령 펼치기</summary><CodeExample code={perceptionCommands[name]} label={label} download={`${assets}/${name}.sh`}/></details>; }
const figureSizes: Record<string, [number, number]> = { "synthetic-samples.jpg": [1308, 1024], "real-crops.jpg": [1372, 704], "scan-overlay.jpg": [2816, 900], "prediction-crop_0005.jpg": [960, 600], "prediction-crop_0007.jpg": [960, 600], "prediction-crop_0009.jpg": [960, 600], "prediction-crop_0050.jpg": [960, 600] };
function Figure({ name, alt, children }: { name: string; alt: string; children: ReactNode }) { return <figure><Image unoptimized src={`${assets}/${name}`} alt={alt} width={figureSizes[name][0]} height={figureSizes[name][1]} loading={name === "synthetic-samples.jpg" ? "eager" : "lazy"} fetchPriority={name === "synthetic-samples.jpg" ? "high" : "auto"} sizes="(max-width: 767px) 100vw, 900px" style={{ width: "100%", height: "auto" }}/><figcaption>{children}</figcaption></figure>; }

export default async function PerceptionLessonPage() {
  await requireEducationMember("/education/object-recognition/synthetic-data");
  return <>
    <Breadcrumbs items={[{ label: "교육", href: "/education" }, { label: "객체인식", href: objectRecognitionPath }, { label: "합성 데이터로 시작하기" }]}/>
    <article className="perception-lesson">
      <header className="perception-hero"><h1>합성 데이터로 시작하는<br/>객체인식</h1><p>사진 속 정다면체와 과일을 찾는 모델을 직접 만들어봅니다. 사진과 정답지가 무엇인지부터, 120장짜리 첫 실습과 실제 카메라 검증까지 차근차근 따라갑니다.</p><LessonAuthor path="/education/object-recognition/synthetic-data"/><a className="button" href={repo}>실습 저장소 열기</a></header>
      <Figure name="synthetic-samples.jpg" alt="다양한 사진 배경 위의 정다면체와 과일 큐브, 물체 경계 정답이 표시된 합성 학습 이미지"><strong>이 선은 모델의 예측이 아니라 렌더러가 만든 정답입니다.</strong> 마지막처럼 찾을 물체가 없는 장면도 학습에 포함합니다. 원본: 똥개 프로젝트.</Figure>

      <Chapter id="first-look" title="1. 객체인식은 무엇을 알아내는 걸까?">
        <p>로봇 앞에 사과 그림이 붙은 큐브와 정팔면체가 있다고 생각해봅시다. 로봇이 사과 큐브를 집으려면 먼저 사진에서 그 물체를 찾아야 합니다. 사람에게는 쉬운 일이지만 컴퓨터가 처음 받는 것은 빨강·초록·파랑 밝기 값으로 이루어진 픽셀 배열입니다.</p>
        <p><strong>모델</strong>은 이 숫자 배열을 보고 답을 계산하는 함수입니다. 정답이 있는 예시를 반복해서 보여주며 함수 안의 숫자, 즉 가중치를 수정하는 과정이 <strong>학습</strong>입니다. 학습된 모델을 새 사진에 적용하는 과정은 <strong>추론</strong>이라고 합니다.</p>
        <div className="education-table-wrap"><table><caption>비슷해 보이는 세 가지 문제</caption><thead><tr><th>문제</th><th>묻는 것</th><th>결과</th></tr></thead><tbody><tr><td>classification</td><td>이 사진은 무엇인가?</td><td>사과</td></tr><tr><td>detection</td><td>무엇이 어디에 있는가?</td><td>사과 + 사각형 위치</td></tr><tr><td>instance segmentation</td><td>각 물체가 차지하는 영역은?</td><td>사과 + 물체별 픽셀 경계</td></tr></tbody></table></div>
        <p>여기서는 넓은 의미의 객체인식을 배우고, 실습에는 각 물체의 영역을 찾는 <strong>YOLO segmentation 모델</strong>을 사용합니다. 형태만 맞히는 것과, 여러 물체를 각각 찾아 경계를 그리는 것은 서로 다른 작업입니다.</p>
        <Check><p>사진 전체에 “사과”라는 답 하나를 붙이면 classification입니다. 사진에 있는 사과 두 개를 각각 찾아 경계를 그리면 instance segmentation입니다.</p></Check>
      </Chapter>

      <Chapter id="labels" title="2. 학습에는 사진과 정답지가 함께 필요하다">
        <p>사진만 많이 모으면 컴퓨터가 저절로 사과의 이름을 알게 될까요? 이 실습은 <strong>지도학습</strong>이므로, 사진마다 “이 영역은 사과”라는 정답을 함께 줍니다. 이 정답을 라벨, 정답 영역을 마스크라고 부릅니다.</p>
        <p>YOLO segmentation 라벨은 물체 하나당 텍스트 한 줄입니다. 첫 숫자는 클래스 번호, 뒤의 숫자는 경계를 따라 찍은 점의 x, y 좌표입니다. 좌표를 이미지 너비와 높이로 나누어 0부터 1 사이로 저장합니다. 좌표 개수는 물체 윤곽에 따라 달라집니다.</p>
        <CodeExample label="라벨 형식 예시" code={'0 0.20 0.25 0.60 0.25 0.60 0.75 0.20 0.75\n# 설명용 사각형 예시: 클래스 0, 경계점 4개\n# 실제 labels/*.txt에는 주석 줄을 넣지 않습니다.'}/>
        <p>640×640 사진에서 점 (128, 160)은 (0.20, 0.25)로 저장됩니다. 클래스 0의 뜻은 데이터셋마다 다릅니다. A1 모델에서는 큐브 형태이고, 과일 면 모델에서는 사과입니다. 그래서 클래스 이름과 순서를 적은 <code>data.yaml</code>을 함께 사용합니다.</p>
        <p>가려져서 보이지 않는 사과 면에 사과 정답을 붙이지 않습니다. 빈 면이 보인다는 사실도 “이 큐브의 다른 면에는 과일이 없다”는 뜻은 아닙니다. <strong>카메라가 볼 수 있는 근거만 정답으로 만듭니다.</strong></p>
        <p>라벨 형식의 자세한 규칙은 <a href="https://docs.ultralytics.com/datasets/segment">Ultralytics segmentation 데이터 문서</a>에서 확인할 수 있습니다.</p>
        <Check><p>물체를 더 크게 렌더링하면 사진뿐 아니라 경계 좌표도 함께 바뀌어야 합니다. 사진과 정답의 위치가 어긋나면 잘못된 위치를 학습하게 됩니다.</p></Check>
      </Chapter>

      <Chapter id="synthetic" title="3. 사진을 찍는 대신, 사진과 정답을 함께 만든다">
        <p>실물 사진을 수만 장 찍고 일일이 경계를 그리는 일은 시간이 많이 듭니다. 물체의 3D 모양을 알고 있다면 Blender에서 카메라와 조명을 놓고 사진처럼 이미지를 만들 수 있습니다. 이 계산을 <strong>렌더링</strong>, 만들어진 학습 예시를 <strong>합성 데이터</strong>라고 합니다. BlenderProc는 이 과정을 Python 코드로 자동화하는 도구입니다.</p>
        <ol className="education-process"><li><strong>물체 준비</strong><span>8cm 정다면체와 과일 그림이 붙은 큐브를 만듭니다.</span></li><li><strong>장면 바꾸기</strong><span>물체의 위치·회전·크기, 배경·조명·색감을 바꿉니다.</span></li><li><strong>사진 만들기</strong><span>카메라에서 보이는 장면을 렌더링합니다.</span></li><li><strong>정답 저장</strong><span>각 물체의 보이는 경계와 클래스, 생성 기록을 함께 내보냅니다.</span></li></ol>
        <p>소개 메시지에서 말한 “공중에 오브젝트를 섞는다”는 것은 다양한 배경 앞에 물체를 배치해 많은 시점과 겹침을 만드는 방식입니다. 로봇이 실제로 물체를 공중에서 찾는다는 뜻은 아닙니다.</p>
        <h3>왜 배경과 밝기를 일부러 바꿀까?</h3>
        <p>모든 사과가 같은 책상에서 찍혔다면 모델이 사과 대신 책상을 단서로 사용할 수 있습니다. 배경과 조명을 계속 바꾸면 우연한 단서에 의존하기 어려워집니다. 이런 방식을 <strong>도메인 랜덤화</strong>라고 합니다. 도메인은 촬영 환경이나 데이터가 만들어지는 조건을 뜻합니다.</p>
        <div className="education-note"><p><strong>당시 실험과 지금의 공개 실습</strong></p><p>당시에는 COCO 사진을 배경으로 넣고 색감·밝기 등을 바꿨습니다. 현재 고정한 공개 재현 레시피는 <code>--arena_background_ratio 1.0</code>으로 경기장 배경을 생성합니다. 둘 다 데이터의 다양성을 만들지만 결과 이미지는 다릅니다. COCO 배경 실험은 뒤의 확장 실습에서 다룹니다.</p></div>
        <p>“약 5만 장”은 소개한 실험의 규모입니다. “정다면체는 약 5천 장으로도 잘 됐다”는 당시 경험이며, 모든 문제에 필요한 최소 장수를 뜻하지 않습니다. 장면 한 장에 물체가 여러 개일 수 있고, 큐브를 잘라 만든 면 이미지 수는 장면 수보다 많을 수도 있습니다. 데이터 개수에는 무엇을 세었는지 함께 적어야 합니다.</p>
        <p>랜덤화만으로 실제 카메라와의 차이가 모두 없어지지는 않습니다. 과일 그림 크기, 종이의 반사, 카메라 흔들림처럼 실제로 중요한 조건도 넣어야 합니다.</p>
      </Chapter>

      <Chapter id="pipeline" title="4. 형태부터 찾고, 큐브만 다시 살펴본다">
        <p>똥개 프로젝트는 한 번에 모든 답을 내는 대신 두 단계로 나눴습니다. 첫 모델 A1이 물체의 형태를 찾고, 큐브처럼 생긴 물체만 잘라 두 번째 모델에 전달합니다. 잘라낸 작은 이미지를 <strong>크롭</strong>이라고 합니다.</p>
        <div className="education-table-wrap"><table><caption>두 모델의 역할과 클래스 순서</caption><thead><tr><th>모델</th><th>입력과 역할</th><th>정답 클래스</th></tr></thead><tbody><tr><td>A1</td><td>전체 장면 → 형태 영역</td><td>0 cube_like_object<br/>1 octahedron (정팔면체)<br/>2 dodecahedron (정십이면체)<br/>3 icosahedron (정이십면체)</td></tr><tr><td>과일 면</td><td>큐브 크롭 → 보이는 면</td><td>0 apple · 1 orange<br/>2 banana · 3 pineapple<br/>4 plain (빈 면)</td></tr></tbody></table></div>
        <p>정다면체는 첫 단계에서 답이 나오므로 두 번째 모델을 거치지 않습니다. 큐브는 바깥 모양이 같아도 과일 면이 다르므로 한 번 더 봅니다. 크롭에 여백을 더하고 224px 크기의 입력으로 학습합니다.</p>
        <Figure name="real-crops.jpg" alt="실제 경기장에서 촬영한 큐브 크롭 10개, 과일 그림 크기와 밝기가 서로 다르고 빈 면도 보임">실제 사진에는 작은 그림, 반사, 흐림과 빈 면이 섞여 있습니다. 합성 이미지와 비교하면서 어떤 조건이 빠졌는지 찾아보세요.</Figure>
        <p>실제 로봇은 여기서 깊이 카메라와 좌표 변환으로 물체 위치를 계산합니다. 이번 실습은 <strong>사진에서 영역과 이름을 알아내는 부분</strong>까지입니다. 2D detection box만으로 로봇과의 거리까지 알 수 있는 것은 아닙니다.</p>
      </Chapter>

      <Chapter id="setup" title="5. 실습 저장소와 환경을 준비한다">
        <p>먼저 CPU로 120장을 만들고 모델을 1 epoch 학습해 전체 연결을 확인합니다. Epoch는 학습 데이터를 한 바퀴 보는 단위입니다. 이것은 동작 확인용이며 정확도가 높은 완성 모델을 만드는 실험은 아닙니다. CPU 렌더링과 학습도 시간이 걸립니다.</p>
        <p>Linux 또는 WSL에서 Git, Python 3.11, 인터넷 연결을 준비하세요. Windows PowerShell과 GPU용 명령은 <a href={`${source}/perception/docs/synthetic-data-reproduction.md`}>원본 재현 문서</a>에 있습니다. 교육 저장소에는 필요한 생성·학습 소스를 고정 버전으로 담았습니다.</p>
        <CodeExample label="교육 저장소 복제" code={'git clone https://github.com/merosnurobotics/meroedu-detection.git\ncd meroedu-detection/lessons/01-synthetic-data\nsource steps/01-environment.sh'}/>
        <p>가상환경은 프로젝트 전용 Python 패키지 공간입니다. 이 실습의 기준은 Python 3.11, BlenderProc 2.8.0, bpy 5.0.1, PyTorch 2.10.0, torchvision 0.25.0, Ultralytics 8.4.54입니다. 첫 단계는 CPU용 PyTorch를 설치합니다. GPU로 확장할 때는 같은 가상환경에 다른 Torch를 덮어넣지 말고 원본 GPU 설치 단계로 새 환경을 만드세요.</p>
        <Recipe name="01-environment" label="01 환경 설치"/>
        <p>설치 후 버전 출력이 나오는지 확인합니다. 터미널을 새로 열었다면 회차 루트에서 <code>source .venv-perception/bin/activate</code>로 환경을 다시 활성화합니다. 이하 단계는 같은 터미널에서 순서대로 진행하세요.</p>
        <CodeExample label="공개 이미지와 3D 물체 준비" code={'source steps/02-assets.sh\n# 이 단계 후 작업 위치: perception/generation'}/>
        <Recipe name="02-assets" label="02 학습 재료 준비"/>
        <p>공개 Fruits-360 이미지 일부를 과일 면의 재료로 내려받고 8cm 물체를 만듭니다. 이미지의 해시와 출처는 <code>assets-manifest.json</code>에 기록됩니다. 생성 데이터나 텍스처를 공유할 때 Fruits-360의 CC BY-SA 4.0 출처 고지도 함께 유지하세요.</p>
      </Chapter>

      <Chapter id="render" title="6. 120장부터 만들고 정답을 눈으로 확인한다">
        <CodeExample label="소규모 렌더링" code={'# 현재 위치: perception/generation\nsource ../../steps/03-render.sh'}/>
        <Recipe name="03-render" label="03 사진 120장 생성"/>
        <div className="education-table-wrap"><table><caption>처음 알아두면 좋은 생성 옵션</caption><tbody><tr><th>num_images 120</th><td>만들 장면 수</td></tr><tr><th>workers 1</th><td>Blender 프로세스 한 개로 시작</td></tr><tr><th>samples 4</th><td>렌더 품질·계산량을 정하는 샘플 수</td></tr><tr><th>seed 31000000</th><td>무작위 선택의 시작값. 서로 다른 실행의 중복을 추적하는 기준</td></tr><tr><th>negative_ratio 0.18</th><td>목표 물체가 없는 예시 비율. 비슷한 물체를 무조건 정답으로 잡지 않게 함</td></tr><tr><th>meta_v2</th><td>물체와 면의 가시성 등 학습용 추가 기록 저장</td></tr></tbody></table></div>
        <p>출력은 <code>datasets/smoke120</code>입니다. <code>images/train</code>의 사진, <code>labels/train</code>의 정답, <code>_meta/train</code>의 JSON 기록이 한 세트인지 봅니다. 여기의 train 폴더 이름은 렌더러의 원시 저장 위치이며, 최종 학습·검증 분리는 다음 단계에서 합니다.</p>
        <ul><li>물체 경계와 라벨이 같은 위치인가?</li><li>보이지 않는 과일에 정답이 붙지 않았는가?</li><li>클래스가 빠지거나 같은 장면만 반복되지 않는가?</li><li>목표 물체가 없는 사진의 빈 라벨도 정상적으로 저장됐는가?</li></ul>
        <p>이미지 저장 개수만 보고 성공으로 판단하지 마세요. 오류 로그와 누락된 정답이 있다면 여기서 해결합니다. 중단한 작업은 같은 명령에 <code>--resume</code>을 붙여 재개할 수 있습니다. 재개하면서 seed나 재료·설정을 바꾸지 마세요.</p>
        <Check><p>사진은 120장인데 라벨은 110개라면 학습부터 시작하지 않습니다. 누락된 이미지·라벨·메타데이터 세트를 먼저 확인합니다. 빈 라벨 파일은 목표 물체가 없는 정상 예시일 수 있습니다.</p></Check>
      </Chapter>

      <Chapter id="split" title="7. 공부할 문제와 시험 문제를 분리한다">
        <p>학습한 사진으로 다시 시험하면 외운 것을 잘 맞혔는지만 알게 됩니다. 새 장면에서도 작동하는지 알려면 데이터를 나눠야 합니다.</p>
        <dl className="education-definitions"><div><dt>train · 학습용</dt><dd>가중치를 바꾸는 데 사용합니다.</dd></div><div><dt>val · 검증용</dt><dd>학습 중 모델과 설정을 선택할 때 사용합니다.</dd></div><div><dt>test · 최종 평가용</dt><dd>선택을 끝낸 모델을 마지막으로 평가합니다.</dd></div></dl>
        <p>이 레시피는 장면 단위로 80%·10%·10%를 나눕니다. 한 장면에서 잘라낸 모든 크롭은 같은 데이터 묶음에 넣습니다. 같은 장면의 사과는 train, 다른 큐브는 val로 넣으면 배경과 조명이 겹쳐 시험 점수가 부풀려질 수 있습니다. 이를 <strong>데이터 누출</strong>이라고 합니다.</p>
        <CodeExample label="장면 분리와 모델별 데이터 내보내기" code={'# 현재 위치: perception/generation\nsource ../../steps/04-split.sh\nsource ../../steps/05-export.sh'}/>
        <Recipe name="04-split" label="04 장면 분리"/><Recipe name="05-export" label="05 모델별 데이터 내보내기"/>
        <p>분리 기준은 <code>datasets/smoke120/split.json</code>에 저장됩니다. 내보내기는 원시 메타데이터에서 A1의 형태 정답과 큐브 크롭의 면 정답을 따로 만듭니다. <code>smoke120_models/a1_objectseg/data.yaml</code>과 <code>smoke120_face/data.yaml</code>을 확인하세요.</p>
        <div className="education-note"><p>원시 렌더 폴더의 호환용 <code>data.yaml</code>로 바로 학습하지 않습니다. 내보낸 두 YAML의 클래스 순서가 위 표와 같은지, train·val·test 경로가 서로 다른지 확인합니다. <code>manifest.json</code>과 <code>meta_v2_export_audit.json</code>도 함께 살펴보세요.</p></div>
      </Chapter>

      <Chapter id="train" title="8. 첫 모델을 학습한다">
        <p>학습은 모델의 예측과 정답의 차이를 계산하고 그 차이를 줄이는 방향으로 가중치를 조금씩 수정합니다. 이 차이를 수치로 나타낸 것이 <strong>손실(loss)</strong>입니다. 손실이 줄어도 새 사진의 성능이 반드시 좋아지는 것은 아니므로 검증 결과도 함께 봅니다.</p>
        <CodeExample label="A1과 과일 면 학습" code={'# 현재 위치: perception/generation\nsource ../../steps/06-train.sh'}/>
        <Recipe name="06-train" label="06 두 모델 학습"/>
        <p>첫 실습은 1 epoch, batch 4, CPU로 진행합니다. Batch는 한 번의 가중치 수정에 묶어서 넣는 이미지 수입니다. 본 레시피의 모델은 사전학습된 <code>.pt</code>를 불러오지 않고 <code>yolo26s-seg.yaml</code> 구조에서 새로 학습합니다. 따라서 1 epoch의 낮은 점수는 예상 가능한 결과입니다.</p>
        <p>스크립트는 A1 입력을 640px, 과일 면 입력을 224px로 설정하고 클래스 순서와 검증 경로를 검사합니다. 학습 결과는 회차 루트의 <code>runs/perception/smoke120_a1</code>과 <code>smoke120_face</code>에 생깁니다. <code>weights/best.pt</code>는 검증 점수를 기준으로 선택한 모델입니다. <code>recipe.json</code>은 실행 설정을 기록합니다.</p>
        <p>동일한 run 이름을 덮어쓰지 않도록 되어 있습니다. 다시 실험하려면 <code>--name smoke120_a1_v2</code>처럼 새 이름을 쓰고, 이후 평가에서도 그 경로를 사용하세요. 메모리가 부족하면 batch를 줄이고 변경값을 기록하세요.</p>
      </Chapter>

      <Chapter id="evaluate" title="9. 처음 보는 사진에서도 작동하는지 확인한다">
        <p>모델이 없는 물체를 잡으면 <strong>오탐</strong>, 있는 물체를 놓치면 <strong>미탐</strong>입니다. Precision은 잡은 것 중 정답의 비율, recall은 정답 중 찾아낸 비율입니다. IoU는 예측 영역과 정답 영역이 얼마나 겹치는지 나타냅니다. mAP는 클래스별 detection 품질을 요약하는 지표이며, box와 mask 점수는 평가하는 영역이 다릅니다.</p>
        <CodeExample label="남겨둔 test 장면 평가" code={'# 현재 위치: perception/generation → 평가 후 회차 루트\nsource ../../steps/07-evaluate.sh'}/>
        <Recipe name="07-evaluate" label="07 test 평가"/>
        <p>test 점수를 보고 계속 설정을 고르면 test가 사실상 val이 됩니다. 설정은 val에서 고르고 마지막 모델을 test로 평가하세요. 120장 중 일부만 남긴 작은 시험은 성능을 단정하기에도 부족합니다.</p>
        <h3>직접 찍은 실제 사진으로 A1 추론하기</h3>
        <p>별도로 촬영한 사진을 회차 루트의 <code>my-photo.jpg</code>로 준비합니다. 모든 클래스가 잘 보이는 가까운 사진에서 시작하고, 거리·빛·방향을 바꿔봅니다.</p>
        <CodeExample label="실제 사진 추론" code={'yolo segment predict \\\n  model=runs/perception/smoke120_a1/weights/best.pt \\\n  source=my-photo.jpg imgsz=640 device=cpu'}/>
        <p>이 명령은 A1 형태 모델만 실행합니다. 과일 면 모델은 큐브 크롭을 준비해 <code>imgsz=224</code>로 실행합니다. OpenCV의 numpy 이미지는 BGR 순서입니다. PIL에서 RGB 배열로 읽었다면 Ultralytics의 numpy 입력에 넣기 전에 BGR로 바꿔야 합니다. 전체 카메라 사진을 그대로 면 모델에 넣는 것과 큐브 크롭을 넣는 것은 다른 입력입니다.</p>
        <h3>학습된 가중치로 실제 사진을 돌려본 예시</h3>
        <p>똥개 프로젝트의 공개 과일 면 가중치 <code>unified_face_best.pt</code>를 실제 카메라 크롭에 직접 적용했습니다. 왼쪽은 입력 사진, 오른쪽의 색칠된 영역은 모델이 예측한 segmentation mask입니다. 아래 숫자는 각 면의 confidence입니다. 같은 큐브에서도 과일 면과 빈 면을 각각 예측할 수 있습니다.</p>
        <p>입력 크기는 <code>imgsz=224</code>, confidence 기준은 <code>0.25</code>이며 CPU에서 실행했습니다. 이번 120장·1 epoch 실습으로 만든 가중치의 결과와는 별개입니다.</p>
        <div className="education-prediction-grid">
          <Figure name="prediction-crop_0005.jpg" alt="파인애플 큐브의 실제 입력 사진과 모델이 예측한 면 영역 비교">예시 1 · pineapple 면 두 개(0.972, 0.937)와 plain 면(0.963)을 예측했습니다.</Figure>
          <Figure name="prediction-crop_0007.jpg" alt="오렌지 큐브의 실제 입력 사진과 모델이 예측한 두 면 영역 비교">예시 2 · orange 면 두 개를 각각 0.903, 0.684로 예측했습니다.</Figure>
          <Figure name="prediction-crop_0009.jpg" alt="바나나 큐브의 실제 입력 사진과 모델이 예측한 과일 면과 빈 면 비교">예시 3 · banana 면 두 개(0.976, 0.942)와 plain 면(0.974)을 예측했습니다.</Figure>
          <Figure name="prediction-crop_0050.jpg" alt="사과 큐브의 실제 입력 사진과 모델이 예측한 과일 면과 빈 면 비교">예시 4 · apple 면 두 개(0.963, 0.910)와 plain 면(0.974)을 예측했습니다.</Figure>
        </div>
        <p><a href={`${assets}/inference-examples.json`}>가중치 해시·입력 이미지·예측 기록 보기</a> · <a href={`${repo}/blob/main/lessons/01-synthetic-data/scripts/predict_examples.py`}>입력과 예측 비교 이미지 만드는 코드</a></p>
        <h3>실제 로봇에서의 전체 파이프라인</h3>
        <Figure name="scan-overlay.jpg" alt="실제 로봇의 경기장 스캔 이미지에 detection box와 클래스, 거리, 격자 위치가 표시됨">프로젝트의 기존 대회 모델이 실제 로봇에서 만든 결과입니다. 이번 120장 실습의 성능 결과가 아닙니다.</Figure>
        <video controls preload="none" poster={`${assets}/scan-overlay.jpg`} aria-label="똥개 로봇의 실제 경기장 12회 스캔"><source src={`${assets}/scan.mp4`} type="video/mp4"/>브라우저가 영상을 지원하지 않습니다. <a href={`${assets}/scan.mp4`}>영상 다운로드</a></video>
        <p>모델의 confidence는 예측 확신도를 나타내는 점수입니다. 0.9라고 해서 실제 정답일 확률이 항상 90%인 것은 아닙니다. 밝은 흰 물체를 큐브로 잘못 읽는 것처럼 높은 점수의 오탐도 직접 확인해야 합니다.</p>
      </Chapter>

      <Chapter id="improve" title="10. 실습 확장하기">
        <h3>GPU와 5만 장으로 확장하기</h3>
        <p>원본 공개 레시피는 50,000장, 렌더 samples 16, A1 140 epoch, 과일 면 120 epoch를 사용합니다. GPU 환경에서 한 worker부터 시작해 안정성을 확인하세요. 배치와 worker 수는 장비에 맞춰 조정하되 바꾼 설정을 기록합니다. 아래 전체 레시피에서는 출력 폴더 이름도 바뀌므로 분리·내보내기·학습 단계를 모두 같은 이름으로 이어야 합니다.</p>
        <p><a href={`${assets}/source-reproduction.md`} download>고정 버전 전체 재현 문서 다운로드</a> · <a href={`${assets}/full-render.sh`} download>5만 장 GPU 렌더 명령 다운로드</a></p>
        <h3>당시 방식처럼 COCO 배경을 사용해보기</h3>
        <p><code>perception/generation</code>에서 배경을 준비한 후 렌더 명령의 <code>background_dir</code>을 아래 경로로 바꾸고 <code>arena_background_ratio</code>를 0.0으로 설정합니다. 새 출력 폴더와 별도의 seed를 사용하세요. COCO 배경 사진 속 원래 사물은 이번 목표 클래스의 정답이 아닙니다. 이 실험은 공개 경기장 레시피와 따로 평가합니다.</p>
        <CodeExample label="COCO 배경 준비" code={'python scripts/download_coco2017_backgrounds.py \\\n  --split val2017 --output datasets/backgrounds/coco2017\n# 렌더 명령에서 변경할 두 옵션:\n# --background_dir datasets/backgrounds/coco2017/val2017\n# --arena_background_ratio 0.0'}/>
        <h3>Codex에게 재현을 맡길 때</h3>
        <CodeExample label="실습 도움 요청 예시" code={'이 저장소의 README와 docs를 읽고 CPU 120장 실습을 따라갈 수 있게 도와줘.\n먼저 Python 버전과 가상환경, 현재 작업 경로를 확인해줘.\n사진·라벨·메타데이터가 모두 생성되고 정답이 맞는지 확인한 다음 진행해줘.\n같은 장면의 크롭은 train/val/test를 넘지 않게 유지하고 클래스 순서를 바꾸지 마.\n오류가 나면 원인과 수정한 설정을 기록해줘.\nGPU 5만 장 렌더링이나 장시간 학습은 장비와 설정을 확인한 후 진행하자.'}/>
        <Check><p>오늘 실습이 끝났다면 사진·정답·메타데이터가 한 세트라는 것, 형태와 과일 면이 서로 다른 모델이라는 것, 학습에 쓰지 않은 사진으로 평가해야 한다는 것을 설명할 수 있습니다. GPU 환경을 준비했다면 같은 순서로 렌더링부터 학습까지 확장해보세요.</p></Check>
      </Chapter>
      <footer className="education-sources"><h2>원본과 실습 기록</h2><p>조연우의 자료 소개와 똥개 저장소 문서·코드를 입문용으로 재구성했습니다. 기준 커밋은 <code>{perceptionSourceCommit.slice(0, 7)}</code>입니다. 이 페이지의 CPU 120장·1 epoch 명령은 원본 소규모 렌더 레시피를 연결한 실습입니다. 웹페이지와 명령 형식은 검증했으며, 새 렌더링이나 재학습은 수행하지 않았으며, 위 네 가지 예시는 기존 공개 가중치로 직접 실행한 추론 결과입니다. 예시 이미지의 개수로 모델 전체 성능을 판단하지 않습니다.</p><ul><li><a href={`${source}/perception/README.md`}>인식 파이프라인 소개</a></li><li><a href={`${source}/perception/docs/synthetic-data-reproduction.md`}>공개 데이터 생성·학습 재현 방법</a></li><li><a href={`${source}/perception/docs/synthetic-data.md`}>합성 데이터 설계와 라벨 규칙</a></li><li><a href={`${source}/perception/docs/synthetic-data-experiments.md`}>실험 기록과 실패 사례</a></li><li><a href="https://docs.ultralytics.com/modes/train">Ultralytics 학습 문서</a></li><li><a href={`${assets}/LICENSE.txt`}>원본 MIT 라이선스</a> · <a href={`${assets}/provenance.json`}>이식 기록</a></li></ul></footer>
    </article>
  </>;
}
