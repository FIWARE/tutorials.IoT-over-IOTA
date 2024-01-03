[![FIWARE Banner](https://fiware.github.io//tutorials.IoT-over-IOTA/img/fiware.png)](https://www.fiware.org/developers)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://github.com/FIWARE/catalogue/blob/master/iot-agents/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.IoT-over-MQTT.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
[![UltraLight 2.0](https://img.shields.io/badge/Payload-Ultralight-27ae60.svg)](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
<br/> [![Documentation](https://img.shields.io/readthedocs/fiware-tutorials.svg)](https://fiware-tutorials.rtfd.io)

このチュートリアルでは、FIWARE に接続する IoT デバイスの接続を拡張して、代替トランスポートを使用します。 
[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent)で作成された
[UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) IoT
Agent は、[IOTA Tangle](https://www.iota.org/get-started/what-is-iota) を介して安全なメッセージを転送するダミーの IoT
デバイスのセットと通信するように再構成されています。 以前の [MQTT チュートリアル](https://github.com/FIWARE/tutorials.IoT-over-MQTT)
のアーキテクチャに追加のゲートウェイ・コンポーネントが追加され、分散型台帳ネットワーク全体で安全な消えない
トランザクションが可能になります。

チュートリアルは主にカスタム・コンポーネントのアーキテクチャに関係していますが、必要に応じて[cUrl](https://ec.haxx.se/)
コマンドを使用し、[Postman ドキュメント](https://fiware.github.io/tutorials.IoT-over-IOTA/) としても利用できます。 

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/513743-68eeeb6f-30c7-4300-ae6d-a41813e13155?action=collection%2Ffork&collection-url=entityId%3D513743-68eeeb6f-30c7-4300-ae6d-a41813e13155%26entityType%3Dcollection%26workspaceId%3Db6e7fcf4-ff0c-47cb-ada4-e222ddeee5ac)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/FIWARE/tutorials.IoT-Agent-over-IOTA/tree/NGSI-v2)

## コンテンツ

<details>
<summary><strong>詳細</strong></summary>

-   [IOTA とは](#what-is-iota)
-   [アーキテクチャ](#architecture)
    -   [Mosquitto の構成](#mosquitto-configuration)
    -   [ダミー IoT デバイスの構成](#dummy-iot-devices-configuration)
    -   [IoT Agent for UltraLight 2.0 の構成](#iot-agent-for-ultralight-20-configuration)
    -   [MQTT-IOTA ゲートウェイ の構成](#mqtt-iota-gateway-configuration)
-   [前提条件](#prerequisites)
    -   [Docker と Docker Compose](#docker-and-docker-compose)
    -   [Cygwin for Windows](#cygwin-for-windows)
-   [起動](#start-up)
    -   [デバイスのプロビジョニング](#provisioning-devices)
        -   [IOTA-Gateway のログを表示 (1️⃣st ターミナル)](#display-the-iota-gateway-logs-onest-terminal)
        -   [ダミー・デバイスのログを表示 (2️⃣nd ターミナル)](#display-the-dummy-device-logs-twond-terminal)
-   [IOTA Tangle をトランスポートとして使用](#using-the-iota-tangle-as-a-transport)
    -   [コマンドの送信](#sending-commands)
    -   [デバイスの測定値の送信](#sending-device-measures)
    -   [MQTT-IOTA ゲートウェイ - サンプル・コード](#mqtt-iota-gateway---sample-code)
        -   [MQTT-IOTA ゲートウェイ・サウスバウンド - サンプル・コード](#mqtt-iota-gateway-southbound---sample-code)
        -   [MQTT-IOTA ゲートウェイ・ノースバウンド - サンプル・コード](#mqtt-iota-gateway-northbound---sample-code)
    -   [IOTA Tangle デバイス - サンプル・コード](#iota-tangle-device---sample-code)
        -   [IOTA Tangle デバイスのコマンドの確認](#iota-tangle-device-command-acknowledgement)
        -   [IOTA Tangle デバイスの測定- サンプル・コード](#iota-tangle-device-measure---sample-code)
-   [次のステップ](#next-steps)

</details>

<a name="what-is-iota"></a>

# IOTA とは

> “Hansel took his little sister by the hand, and followed the pebbles which shone like newly-coined silver pieces, and
> showed them the way.”
>
> ― Jacob Grimm, Grimm's Fairy Tales

[IOTA Tangle](https://www.iota.org/get-started/what-is-iota) は、分散型台帳として使用できる有向非巡回グラフです。
これは従来のブロックチェーンではありませんが、現在のトランザクション履歴と、分散ネットワークで信頼できる唯一の情報源を
提供する親から子のトランザクションへのリンクを含む Tangle の概念で機能します。情報が Tangle に保持されるときはいつでも、
それはすべてのノードに複製されるので、世界中のどのクライアントも有効なトランザクションをノードに送信できます。

IOTA は、その無料の性質 (feeless nature) とスケーラブルな分散構造により、IoT の理想的な分散型台帳であると自負しています。
明らかに、スマート・システムを設計する場合、開発者は価格、速度、信頼性、セキュリティなどのさまざまな要素の間で妥協する
必要があります。以前の MQTT チュートリアルは高速でしたが、セキュリティ要素が含まれておらず、悪意のある攻撃に対して
脆弱でした。IOTA ベースの IoT システムには、すべてのイベントの安全なログが自動的に含まれるため、イベントごとに顧客に
課金するために使用できます。

標準の MQTT トランスポート (ARV の場所の継続的な追跡など) を使用して、頻繁ではあるがリスクの低いトランザクションを実行
できるハイブリッド・システムも想定できますが、IOTA などの安全なシステム (旅行全体のクレジットカードによる支払い)
を使用して、頻度は低いが課金対象のイベントを作成できます。

基本的な IOTA アーキテクチャには、次の基本的なコンポーネントが含まれています:

-   **Clients**: Tangle に接続するためにノードにトランザクションを送信する IOTA ネットワーク (ウォレット、アプリなど)
    のユーザ
-   **Nodes**: Tangle の整合性を確保する責任がある接続されたデバイス。これらのデバイスは IOTA ネットワークを形成します
-   **Tangle**: 接続されたデータ構造 (パブリック元帳、メイン元帳)。IOTA ネットワーク内のすべてのノードに複製されます

このチュートリアルでは、ダミー・デバイスからのすべてのデータが IOTA タングル内に保存されます。各デバイスの読み取り値は
トランザクション・オブジェクトに配置され、IOTA Tangle にアタッチされます。一度アタッチされると、変更できず、
不変になります。 明らかに、すべてのノードがトランザクションが発生したことに同意するには時間がかかるため、
すべての通信は非同期と見なす必要があります。

IoT Agent for Ultralight は現在、HTTP, MQTT, AMPQ の3つの標準トランスポート・メカニズムを提供しています。 IOTA
の新しいバインディングを直接作成することは可能ですが、この場合、既存の非同期 MQTT バインディングを再利用し、別の
マイクロ・サービスが IOTA メッセージを処理するゲートウェイ・ソリューションを使用して拡張する方が理にかなっています。
[OPC-UA](https://iotagent-opcua.readthedocs.io/) と [LoRaWAN](https://fiware-lorawan.readthedocs.io/) には、
ゲートウェイ・ソリューションに基づく IoT Agent がすでに存在します。たとえば、IoT Agent for OPC-UA の場合、
その[独自のチュートリアル](https://iotagent-opcua.readthedocs.io/en/latest/opc_ua_agent_tutorial/index.html#step-by-step-tutorial)
では、デバイスの読み取り値が OPC-UA サーバに渡され、IoT Agent が OPC-UA サーバにサブスクライブし、メッセージを NGSI
形式に変換します。このチュートリアルで説明されているゲートウェイ・ソリューションにより、MQTT はメッセージバスとして
効果的に使用されているため、IoT デバイスを MQTT デバイスとしてプロビジョニングし、関連する MQTT トピックを
インターセプトして、データを IOTA Tangle トランザクションに変換し、IOTA Tangle 対応デバイスと通信できます。
各メッセージのペイロードは、既存の [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
構文を引き続き使用するため、同じ FIWARE generic enabler を引き続き使用してデバイスを接続できます。このシナリオで
カスタマイズされたのは、基礎となる**トランスポート**にすぎません。

#### Mosquitto MQTT Broker

[Mosquitto](https://mosquitto.org/) は、このチュートリアルで使用される、すぐに利用できるオープンソースの MQTT Broker
です。これは、EPL/EDL の下でライセンスされて利用可能です。詳細については、`https：//mosquitto.org/` をご覧ください。

#### デバイス・モニタ

このチュートリアルの目的のために、一連のダミー IoT デバイスが作成され、Context Broker に接続されます。使用される
アーキテクチャとプロトコルの詳細は、[IoT センサ・チュートリアル](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2)
にあります。各デバイスの状態は、UltraLight デバイス・モニタの Web ページは次の場所にあります:
`http://localhost:3000/device/monitor`

![FIWARE Monitor](https://fiware.github.io//tutorials.IoT-over-IOTA/img/device-monitor.png)

<a name="architecture"></a>

# アーキテクチャ

このアプリケーションは、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent/)で作成されたコンポーネントに
基づいて構築されています。[Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/)と
[IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) の2つの FIWARE コンポーネントを
利用します。Orion Context Broker の使用は、アプリケーションが _“Powered by FIWARE”_ として認定されるのに十分です。
Orion Context Broker と IoT Agent はどちらも、保持している情報の永続性を維持するためにオープンソースの [MongoDB](https://www.mongodb.com/)
テクノロジに依存しています。また、[以前のチュートリアル](https://github.com/FIWARE/tutorials.IoT-Agent/)で作成したダミー
IoT デバイスを使用します。さらに、オープンソースで EPL/EDL で利用可能な [Mosquitto](https://mosquitto.org/) MQTT Broker
のインスタンスを追加し、カスタム **MQTT-IOTA ゲートウェイ**を作成して有効にします。コマンドを IOTA Tangle に永続化し、
トピックをサブスクライブして、測定とコマンドの確認応答 (acknowledgements) が発生したときに受信します。

したがって、アーキテクチャ全体は次の要素で構成されます:

-   FIWARE [Orion Context Broker](https://fiware-orion.readthedocs.io/en/latest/) は、
    [NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してリクエストを受信します
-   FIWARE [IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) は以下を行います :
    -   [NGSI-v2](https://fiware.github.io/specifications/OpenAPI/ngsiv2) を使用してサウス・バウンド・リクエストを受信し、
        MQTT Broker 用の [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
        の**トピック**に変換します
    -   登録されたトピックについて **MQTT Broker** をリッスンし、測定値をノース・バウンドに送信します
-   [Mosquitto](https://mosquitto.org/) **MQTT Broker** は、必要に応じて MQTT トピックを IoT Agent と IoT デ バイスの間で
    やりとりする中央通信ポイントとして機能します
-   [MongoDB](https://www.mongodb.com/) データベース :
    -   **Orion Context Broker** が、データ・エンティティ、サブスクリプション、レジストレーションなどのコンテキスト・データ
        情報を保持するために使用します
    -   **IoT Agent** がデバイスの URLs や Keys などのデバイス情報を保持するために使用します
-   IOTA Tangle 上で動作する [UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)
    プロトコルを使用して、[ダミー IoT デバイス](https://github.com/FIWARE/tutorials.IoT-Sensors/tree/NGSI-v2)
    のセットとして機能する Web サーバー
-   MQTTトピックメッセージを Tangle に、またはその逆に永続化する MQTT-IOTA ゲートウェイ

要素間のすべての相互作用は TCP を介した HTTP または MQTT リクエストによって開始されるため、エンティティをコンテナ化して、
公開されたポートから実行できます。

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/architecture.png)

Mosquitto MQTT Broker, IoT デバイス および IoT Agent を接続するために必要な構成情報は、関連する `docker-compose.yml`
ファイルのサービス・セクションで確認できます。

<a name="mosquitto-configuration"></a>

## Mosquitto の構成

```yaml
mosquitto:
    image: eclipse-mosquitto
    hostname: mosquitto
    container_name: mosquitto
    networks:
        - default
    expose:
        - "1883"
        - "9001"
    ports:
        - "1883:1883"
        - "9001:9001"
    volumes:
        - ./mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf
```

`mosquitto` コンテナは、2 つのポートでリッスンしています :

-   ポート `1883` は、MQTT のトピックをポストできるように公開されています
-   ポート `9001` は、HTTP/Websocket 通信の標準ポートです

アタッチされたボリュームは、MQTT message broker のデバッグ・レベルを上げるために使用される
[構成ファイル](https://github.com/FIWARE/tutorials.IoT-over-IOTA/blob/NGSI-v2/mosquitto/mosquitto.conf) です。

<a name="dummy-iot-devices-configuration"></a>

## ダミー IoT デバイスの構成

```yaml
tutorial:
    image: quay.io/fiware/tutorials.context-provider
    hostname: iot-sensors
    container_name: fiware-tutorial
    networks:
        - default
    expose:
        - "3000"
        - "3001"
    ports:
        - "3000:3000"
        - "3001:3001"
    environment:
        - "DEBUG=tutorial:*"
        - "WEB_APP_PORT=3000"
        - "DUMMY_DEVICES_PORT=3001"
        - "DUMMY_DEVICES_API_KEYS=1068318794,3020035,3314136,3089326"
        - "DUMMY_DEVICES_TRANSPORT=IOTA"
        - "IOTA_NODE=https://chrysalis-nodes.iota.cafe"
        - "IOTA_MESSAGE_INDEX=fiware"
```

`tutorial` コンテナは、2 つのポートでリッスンしています :

-   ポート `3000` が公開されているので、ダミー IoT デバイスを表示する Web ページが表示されます
-   ポート `3001` はチュートリアルのアクセスのためだけに公開されているため、cUrl または Postman は同じネットワーク
    以外からも、UltraLight コマンドを作成できます

`tutorial` コンテナは、次のように環境変数によって設定値を指定できます :

| キー                    | 値                                  | 説明                                                                                                                                              |
| ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEBUG                   | `tutorial:*`                        | ロギングに使用するデバッグ・フラグ                                                                                                                |
| WEB_APP_PORT            | `3000`                              | ダミー・デバイスのデータを表示する web-app が使用するポート                                                                                       |
| DUMMY_DEVICES_PORT      | `3001`                              | コマンドを受信するためにダミー IoT デバイスが使用するポート                                                                                       |
| DUMMY_DEVICES_API_KEY   | `4jggokgpepnvsb2uv4s40d59ov`        | UltraLight インタラクションに使用されるランダムなセキュリティキー - デバイスと IoT Agent 間のインタラクションの完全性を保証するために使用されます |
| DUMMY_DEVICES_TRANSPORT | `IOTA`                              | ダミー IoT デバイスによって使用されるトランスポート・プロトコル                                                                                   |
| IOTA_NODE               | `https://chrysalis-nodes.iota.cafe` | ゲートウェイが接続する IOTA ノード                                                                                                                |
| IOTA_MESSAGE_INDEX      | `fiware`                            | データ・デバイスを永続化するために使用されるメッセージ・インデックス                                                                              |

YAML ファイルで説明されている他の `tutorial` コンテナ構成値は、このチュートリアルでは使用されません。

<a name="iot-agent-for-ultralight-20-configuration"></a>

## IoT Agent for UltraLight 2.0 の構成

[IoT Agent for UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/) は 、Docker コンテナ内でインスタンス化できます。
公式の Docker イメージは、[Docker Hub](https://hub.docker.com/r/fiware/iotagent-ul/) からタグ付けされた `fiware/iotagent-ul` です。
必要な構成を以下に示します :

```yaml
iot-agent:
    image: quay.io/fiware/iotagent-ul:latest
    hostname: iot-agent
    container_name: fiware-iot-agent
    depends_on:
        - mongo-db
    networks:
        - default
    expose:
        - "4041"
    ports:
        - "4041:4041"
    environment:
        - IOTA_CB_HOST=orion
        - IOTA_CB_PORT=1026
        - IOTA_NORTH_PORT=4041
        - IOTA_REGISTRY_TYPE=mongodb
        - IOTA_LOG_LEVEL=DEBUG
        - IOTA_TIMESTAMP=true
        - IOTA_CB_NGSI_VERSION=v2
        - IOTA_AUTOCAST=true
        - IOTA_MONGO_HOST=mongo-db
        - IOTA_MONGO_PORT=27017
        - IOTA_MONGO_DB=iotagentul
        - IOTA_PROVIDER_URL=http://iot-agent:4041
        - IOTA_MQTT_HOST=mosquitto
        - IOTA_MQTT_PORT=1883
```

`iot-agent` コンテナは、Orion Context Broker の 存在に依存し、そのようなデバイス の URLs 及び Keys としてデバイス情報を
保持するために MongoDB データベースを使用します。コンテナは 1 つのポートで待機しています :

-   ポート 4041 は、チュートリアルのアクセスのためだけに公開されているため、cUrl または Postman は同じネットワーク以外
    からも、プロビジョニング・コマンドを作成できます

`iot-agent` コンテナは、次のように環境変数によって設定値を指定できます :

| キー                 | 値                      | 説明                                                                                                                                   |
| ------------------   | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| IOTA_CB_HOST         | `orion`                 | コンテキストを更新する Context Broker のホスト名                                                                                       |
| IOTA_CB_PORT         | `1026`                  | Context Broker がコンテキストを更新するためにリッスンするポート                                                                        |
| IOTA_NORTH_PORT      | `4041`                  | IoT Agent の設定および Context Broker からのコンテキスト更新の受信に使用されるポート                                                   |
| IOTA_REGISTRY_TYPE   | `mongodb`               | メモリまたはデータベースに IoT デバイス情報を保持するかどうかを指定                                                                    |
| IOTA_LOG_LEVEL       | `DEBUG`                 | IoT Agent のログ・レベル                                                                                                               |
| IOTA_TIMESTAMP       | `true`                  | 接続されたデバイスから受信した各測定値にタイムスタンプ情報を提供するかどうかを指定                                                     |
| IOTA_CB_NGSI_VERSION | `v2`                    | アクティブな属性の更新を送信するときにNGSI v2 を使用するように指定するかどうか                                                         |
| IOTA_AUTOCAST        | `true`                  | Ultralight の数値が文字列ではなく数値として読み取られるようにする                                                                      |
| IOTA_MONGO_HOST      | `context-db`            | mongoDB のホスト名 - デバイス情報を保持するために使用                                                                                  |
| IOTA_MONGO_PORT      | `27017`                 | mongoDB はリッスンしているポート                                                                                                       |
| IOTA_MONGO_DB        | `iotagentul`            | mongoDB で使用されるデータベースの名前                                                                                                 |
| IOTA_PROVIDER_URL    | `http://iot-agent:4041` | コマンドが登録されたときに Context Broker に渡された URL。Context Broker がデバイスにコマンドを発行したときに転送 URL の場所として使用 |
| IOTA_MQTT_HOST       | `mosquitto`             | MQTT Broker のホスト名                                                                                                                 |
| IOTA_MQTT_PORT       | `1883`                  | MQTT Broker がトピックを受信するためにリッスンしているポート                                                                           |

ご覧のように、MQTT トランスポートの使用は、2 つの環境変数 `IOTA_MQTT_HOST` と `IOTA_MQTT_PORT`
によってのみ制御されます。

<a name="mqtt-iota-gateway-configuration"></a>

## MQTT-IOTA ゲートウェイ の構成

```yaml
iota-gateway:
    image: iota-gateway
    hostname: iota-gateway
    container_name: iota-gateway
    build:
        context: iota-gateway
        dockerfile: Dockerfile
    networks:
        - default
    environment:
        - "DEBUG=gateway:*"
        - "MQTT_BROKER_URL=mqtt://mosquitto"
        - "IOTA_NODE=https://chrysalis-nodes.iota.cafe"
        - "IOTA_MESSAGE_INDEX=fiware"
```

`iota-gateway` コンテナは、MQTT Broker に接続し、トランザクションを読み取り、IOTA Tangle に永続化するミドルウェアです。
したがって、このミドルウェアは MQTT Brker と IOTA Tangle の両方に接続する必要があり、上記のパラメータの一部を
繰り返します。

<a name="prerequisites"></a>

# 前提条件

<a name="docker-and-docker-compose"></a>

## Docker と Docker Compose

物事を単純にするために、両方のコンポーネントが [Docker](https://www.docker.com) を使用して実行されます。**Docker**
は、さまざまコンポーネントをそれぞれの環境に分離することを可能にするコンテナ・テクノロジです。

-   Docker Windows にインストールするには、[こちら](https://docs.docker.com/docker-for-windows/)
    の手順に従ってください
-   Docker Mac にインストールするには、[こちら](https://docs.docker.com/docker-for-mac/)の手順に従ってください
-   Docker Linux にインストールするには、[こちら](https://docs.docker.com/install/)の手順に従ってください

**Docker Compose** は、マルチコンテナ Docker アプリケーションを定義して実行するためのツールです。
[YAML file](https://raw.githubusercontent.com/Fiware/tutorials.IoT-over-IOTA/NGSI-v2/docker-compose.yml)
ファイルは、アプリケーションのために必要なサービスを構成するために使用します。つまり、すべてのコンテナ・サービスは
1 つのコマンドで呼び出すことができます。Docker Compose は、デフォルトで Docker for Windows と Docker for Mac
の一部としてインストールされますが、Linux ユーザは[ここ](https://docs.docker.com/compose/install/)
に記載されている手順に従う必要があります。

次のコマンドを使用して、現在の **Docker** バージョンと **Docker Compose** バージョンを確認できます :

```console
docker-compose -v
docker version
```

Docker バージョン 20.10 以降と Docker Compose 1.29 以上を使用していることを確認し、必要に応じてアップグレード
してください。

<a name="cygwin-for-windows"></a>

## Cygwin for Windows

シンプルな bash スクリプトを使用してサービスを開始します。Windows ユーザは [cygwin](http://www.cygwin.com/)
をダウンロードして、Windows 上の Linux ディストリビューションと同様のコマンドライン機能を提供する必要があります。

<a name="start-up"></a>

# 起動

開始する前に、必要な Docker イメージをローカルで取得または構築しておく必要があります。リポジトリを複製し、
以下のコマンドを実行して必要なイメージを作成してください:

```console
git clone https://github.com/FIWARE/tutorials.IoT-over-IOTA.git
cd tutorials.IoT-over-IOTA
git checkout NGSI-v2

./services create
```

その後、リポジトリ内で提供される [services](https://github.com/FIWARE/tutorials.IoT-over-IOTA/blob/NGSI-v2/services)
Bash スクリプトを実行することによって、コマンドラインからすべてのサービスを初期化することができます:

```console
./services start
```

> :information_source: **注意:** クリーンアップをやり直したい場合は、次のコマンドを使用して再起動することができます:
>
> ```console
> ./services stop
> ```

<a name="provisioning-devices"></a>

## デバイスのプロビジョニング

デバイスのプロビジョニングは、このチュートリアルの焦点ではなく、チュートリアルの開始時に必要なすべてのデバイスの
プロビジョニングが自動的に行われます。ただし、完全を期すために、プロビジョニング・リクエストはここで繰り返され、
以下で説明されます。これらのコマンドを再実行する必要はありません。

デバイスのクラスを API キーに関連付けるために、一連のサービス・グループが作成されます。以下の例では、`type=Bell`
と `type=Motion` のサービスが作成されています。`resource` 属性は空白のままで、`transport` は `MQTT` に設定されている
ことに注意してください。これは、IoT Agent が MQTT Broker にメッセージを送信するだけなので、カスタム・ゲートウェイ・
コンポーネントも含まれていることを認識していないため、これは以前の MQTT チュートリアルと同じです。

```console
curl -X POST  \
  "http://localhost:4041/iot/services" \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
 "services": [
   {
     "apikey":      "1068318794",
     "cbroker":     "'"http://orion:1026"'",
     "entity_type": "Motion",
     "resource":    "",
     "protocol":    "PDI-IoTA-UltraLight",
     "transport":   "MQTT",
     "timezone":    "Europe/Berlin",
     "attributes": [
        {"object_id": "c", "name":"count", "type":"Integer"},
        {"object_id": "t", "name": "TimeInstant", "type":"DateTime"}
      ],
      "static_attributes": [
          {"name": "category", "type":"Text", "value": ["sensor"]},
          {"name": "controlledProperty", "type": "Text", "value": "motion"},
          {"name": "function", "type": "Text", "value":["sensing"]},
          {"name": "supportedProtocol", "type": "Text", "value": ["ul20"]},
          {"name": "supportedUnits", "type": "Text", "value": "C62"}
      ]
   },
   {
     "apikey":      "3020035",
     "cbroker":     "'"http://orion:1026"'",
     "entity_type": "Bell",
     "resource":    "",
     "protocol":    "PDI-IoTA-UltraLight",
     "transport":   "MQTT",
     "timezone":    "Europe/Berlin",
     "commands": [
        {
          "name": "ring",
          "type": "command"
        }
      ],
      "static_attributes": [
          {"name": "category", "type":"Text", "value": ["actuator"]},
          {"name": "controlledProperty", "type": "Text", "value": "noiseLevel"},
          {"name": "function", "type": "Text", "value":["onOff"]},
          {"name": "supportedProtocol", "type": "Text", "value": ["ul20"]}
      ]
   }
 ]
}'
```

個々のデバイスがプロビジョニングされるときに定義されるコマンドと測定。ここでも、`transport` は MQTT
に設定されています。

```console
curl -X POST \
  "http://localhost:4041/iot/devices" \
  -H 'Content-Type: application/json' \
  -H 'fiware-service: openiot' \
  -H 'fiware-servicepath: /' \
  -d '{
 "devices": [
   {
     "device_id":   "motion001",
     "entity_name": "urn:ngsi-ld:Motion:001",
     "entity_type": "Motion",
     "transport":   "MQTT",
     "static_attributes": [
         {"name": "refStore", "type": "Relationship","value": "urn:ngsi-ld:Store:001"}
     ]
   },
   {
      "device_id": "bell001",
      "entity_name": "urn:ngsi-ld:Bell:001",
      "entity_type": "Bell",
      "transport":   "MQTT",
      "static_attributes": [
          {"name": "refStore", "type": "Relationship","value": "urn:ngsi-ld:Store:001"}
      ]
    }
  ]
}
'
```

#### デバイス・モニタ

デバイス・モニタは次の場所にあります: `http://localhost:3000/device/monitor` - Web ページを開いてデバイスの状態を
表示し、永続化された IOTA Tangle トラフィックを表示します。

<a name="display-the-iota-gateway-logs-onest-terminal"></a>

### IOTA-Gateway のログを表示 (1️⃣st ターミナル)

**新しいターミナル**を開き、次のように `iota-gateway` Docker コンテナを実行します:

```console
docker logs -f iota-gateway
```

これで、ターミナルは受信したメッセージを表示する準備が整います。

#### 1️⃣st ターミナル - ゲートウェイの結果:

MQTT-IOTA ゲートウェイが正しく機能している場合は、次のメッセージが表示されます:

```txt
2021-12-07T15:28:42.855Z gateway:app connected to IOTA Tangle: https://chrysalis-nodes.iota.cafe
2021-12-07T15:28:42.862Z gateway:app Subscribing to 'messages/indexation/fiware/attrs'
2021-12-07T15:28:42.872Z gateway:app Subscribing to 'messages/indexation/fiware/cmdexe'
```

ゲートウェイは、測定とコマンドの確認応答 (acknowledgements) を受信するために IOTA Tangle
にサブスクライブする必要があります。

<a name="display-the-dummy-device-logs-twond-terminal"></a>

### ダミー・デバイスのログを表示 (2️⃣nd ターミナル)

ノースバウンドの測定値を送信するセンサは、トランザクションを IOTA Tangle に永続化し、必要以上にサブスクライバに
渡されます。センサは、サブスクライバに直接接続する必要はありません。同様に、接続されているアクチュエータは、それらに
関連するコマンドを受信するために、IOTA Tangle メッセージ・トピックにサブスクライブする必要があります。

**新しいターミナル**を開き、次のコマンドにより、`fiware-tutorial` Docker コンテナを実行します:

```console
docker logs -f fiware-tutorial
```

これで、ターミナルは受信したメッセージを表示する準備が整います。

#### 2️⃣nd ターミナル - デバイスの結果:

デバイスが正しく機能している場合、メッセージは他のターミナルで受信される必要があります。

```
2021-12-07T15:29:22.163Z tutorial:server Listening on port 3000
2021-12-07T15:29:22.166Z tutorial:server Listening on port 3001
2021-12-07T15:29:22.522Z tutorial:application MongoDB is connected.
2021-12-07T15:29:22.612Z tutorial:iot-device connected to IOTA Tangle: https://chrysalis-nodes.iota.cafe
2021-12-07T15:29:22.613Z tutorial:iot-device Subscribing to 'messages/indexation/fiware/cmd'
```

<a name="using-the-iota-tangle-as-a-transport"></a>

# IOTA Tangle をトランスポートとして使用

<a name="sending-commands"></a>

### コマンドの送信

すべてのデバイスが事前にプロビジョニングされているため、標準の NGSI-v2 PATCH リクエストを使用してベルを
鳴らすことができます。

#### 1️⃣ リクエスト:

```console
curl -L -X PATCH 'http://localhost:1026/v2/entities/urn:ngsi-ld:Bell:001/attrs' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /' \
-H 'Content-Type: application/json' \
--data-raw '{
  "ring": {
      "type" : "command",
      "value" : ""
  }
}'
```

NGSI リクエストは MQTT メッセージ (Ultralight ペイロードを含む) に変換され、MQTT-IOTA ゲートウェイによって受信されます。
このメッセージは、次のように IOTA Tangle に保持されます:

#### 1️⃣st ターミナル - ゲートウェイの結果:

```text
2021-12-07T15:50:54.848Z gateway:southbound Command received from MQTT bell001@ring|
2021-12-07T15:51:12.580Z gateway:southbound Command pushed to Tangle: i=bell001&k=1068318794&d=bell001@ring|  to fiware/cmd
2021-12-07T15:51:12.581Z gateway:southbound messageId: 40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5
```

ダミー・デバイスも IOTA Tangle メッセージをサブスクライブしており、メッセージが受信され、デバイスがアクティブ化されます
(この場合、ベルが鳴ります)。この時点で、確認応答 (acknowledgement) が `fiware/cmdexe` トピックに置かれます:

#### 2️⃣nd ターミナル - デバイスの結果:

```text
2021-12-07T15:51:12.583Z tutorial:iot-device IOTA Tangle message received:  40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5
2021-12-07T15:51:17.806Z tutorial:ultralight command response sent to fiware/cmdexe
2021-12-07T15:51:17.806Z tutorial:ultralight 960e8ac4a9e22e360f7e92c3a7b9ac3b71c59950fd2fba7f4be551f930342f94
2021-12-07T15:51:17.812Z tutorial:devices actuateDevice: bell001 ring
```

デバイス・モニタのページを表示している場合は、ベルの変化の状態も確認できます。

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/bell-ring.gif)

ゲートウェイは、IOTA Tangle の `fiware/cmdexe` トピックから確認応答 (acknowledgement) を受信し、リクエストの結果を
IoT Agent に返します。

#### 1️⃣st ターミナル - ゲートウェイの結果:

```text
2021-12-07T15:51:18.022Z gateway:northbound Command response received from Tangle: i=bell001&k=1068318794&d=bell001@ring| ring OK
2021-12-07T15:51:18.027Z gateway:northbound Sent to MQTT topic /1068318794/bell001/cmdexe
2021-12-07T15:51:34.741Z gateway:northbound Command response received from Tangle: i=bell001&k=1068318794&d=bell001@ring| ring OK
```

ベルを鳴らすコマンドの結果は、Orion Context Broker 内のエンティティにクエリを実行することで読み取ることができます。

#### 2️⃣ リクエスト:

```console
curl -L -X GET 'http://localhost:1026/v2/entities/urn:ngsi-ld:Bell:001?options=keyValues' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /'
```

#### レスポンス:

```json
{
    "id": "urn:ngsi-ld:Bell:001",
    "type": "Bell",
    "TimeInstant": "2021-12-07T15:51:36.219Z",
    "category": ["actuator"],
    "controlledProperty": "noiseLevel",
    "function": ["onOff"],
    "refStore": "urn:ngsi-ld:Store:001",
    "ring_info": " ring OK",
    "ring_status": "OK",
    "supportedProtocol": ["ul20"],
    "ring": ""
}
```

`TimeInstant` は、エンティティに関連付けられているコマンドが最後に呼び出された時刻を示します。`ring`
コマンドの結果は、`ring_info` 属性の値で確認できます。

> **注意:** IOTA トランザクションは瞬時ではありません。トランザクションが完了する前にベルがクエリされた場合、
> レスポンスは `ring_status` を `PENDING` のままにします。
>
> ```
> {
>  "id": "urn:ngsi-ld:Bell:001",
>  "type": "Bell",
>  "TimeInstant": "2021-12-07T15:51:36.219Z",
>  "category": [ "actuator" ],
>  "controlledProperty": "noiseLevel",
>  "function": [ "onOff" ],
>  "refStore": "urn:ngsi-ld:Store:001",
>  "ring_info": "UNKNOWN",
>  "ring_status": "PENDING",
>  "supportedProtocol": [ "ul20" ],
>  "ring": ""
> }
> ```

さらに、すべてのトランザクションは、`https://explorer.iota.org/mainnet/message/<message_id>` 下の IOTA Tangle
にあります。例えば、
`https://explorer.iota.org/mainnet/message/40431e6e39ade9babe02ef342ee9267f69982fe42db8f5d3f32d57bb686120d5`
は、次のデータを永続的に保持します:

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/mainnet.png)

これは、ベルを鳴らすためのリクエストが送信されたことを示します。

<a name="sending-device-measures"></a>

### デバイスの測定値の送信

ドロップ・ダウンから**モーションの検出**を選択し、[送信]をクリックすると、デバイスからの測定値をシミュレート
できます。

![](https://fiware.github.io//tutorials.IoT-over-IOTA/img/device-tangle.png)

デバイスは、IOTA Tangle Mainnet の `fiware/attrs` トピックに測定値を保持します。

#### 2️⃣nd ターミナル - デバイスの結果:

```text
2021-12-07T16:34:25.767Z tutorial:devices fireMotionSensor
2021-12-07T16:34:26.185Z tutorial:northbound sendIOTAMeasure: motion001
2021-12-07T16:34:26.479Z tutorial:ultralight measure sent to fiware/attrs
2021-12-07T16:34:26.479Z tutorial:ultralight da4df31054df529a3ade74befb84edabf7697ae8a3a9ee3481be08ee0aabb3e7
```

トランザクションが決済されると、サブスクライブしているゲートウェイ・コンポーネントに渡されます。

#### 1️⃣st ターミナル - ゲートウェイの結果:

```text
2021-12-07T16:35:25.679Z gateway:northbound Measure received from Tangle: i=motion001&k=1068318794&d=c|0|t|2021-12-07T16:34:44.891Z
2021-12-07T16:35:25.680Z gateway:northbound Sent to MQTT topic /1068318794/motion001/attrs
```

測定値を読み取ってから Context Broker で受信されるまでに、顕著な遅延が生じる可能性があります。したがって、測定値の
ペイロードにはタイムスタンプ `t|2021-12-07T16:34:44.891Z` が含まれ、これは IoT Agent の `TimeInstant` にマップされ、
正しいメタデータが Context Broker の測定値に関連付けられていることを確認します。

センサの状態は、Orion Context Broker 内のエンティティにクエリを実行することで読み取ることができます。

#### 3️⃣ リクエスト:

```console
curl -L -X GET 'http://localhost:1026/v2/entities/urn:ngsi-ld:Motion:001?options=keyValues' \
-H 'fiware-service: openiot' \
-H 'fiware-servicepath: /'
```

#### レスポンス:

```json
{
    "id": "urn:ngsi-ld:Motion:001",
    "type": "Motion",
    "TimeInstant": "2021-12-07T16:34:44.891Z",
    "category": ["sensor"],
    "controlledProperty": "motion",
    "count": "0",
    "function": ["sensing"],
    "refStore": "urn:ngsi-ld:Store:001",
    "supportedProtocol": ["ul20"],
    "supportedUnits": "C62"
}
```

<a name="mqtt-iota-gateway---sample-code"></a>

## MQTT-IOTA ゲートウェイ - サンプル・コード

[MQTT-IOTA ゲートウェイ](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/NGSI-v2/iota-gateway/app)は、Node.js
で記述されたシンプルなアプリケーションです。その唯一の機能は、2つのトランスポート間でデータを渡すことです。MQTT
クライアント・ライブラリはすでに存在するため、IoT Agent の作動に関する通常の MQTT トピックをリッスンするように
アプリケーションを設定できます。

```javascript
const mqtt = require("mqtt");
const MQTT_CLIENT = mqtt.connect("mqtt://mosquitto");
MQTT_CLIENT.on("connect", () => {
    MQTT_CLIENT.subscribe("/+/+/cmd");
});
MQTT_CLIENT.on("message", Southbound.command);
```

同様に、IOTA Tangle の変更を永続化してリッスンするために、複数の言語で利用可能な同等の
[クライアント・ライブラリ](https://wiki.iota.org/iota.rs/libraries/nodejs/getting_started) があります。MQTT-IOTA
ゲートウェイは、2つのトピックをリッスンする必要があります。1つはデバイスの測定用で、もう1つはコマンドの確認用です:

```javascript
const iotaClient = require("@iota/client");
const IOTA_CLIENT = new iotaClient.ClientBuilder().node("https://chrysalis-nodes.iota.cafe").build();

IOTA_CLIENT.getInfo()
    .then(() => {
        IOTA_CLIENT.subscriber()
            .topic(IOTA_MESSAGE_INDEX + "messages/indexation/fiware/attrs")
            .subscribe((err, data) => {
                const messageId = IOTA_CLIENT.getMessageId(data.payload);
                IOTA_CLIENT.getMessage()
                    .data(messageId)
                    .then((messageData) => {
                        Northbound.measure(messageData);
                    });
            });
        IOTA_CLIENT.subscriber()
            .topic(IOTA_MESSAGE_INDEX + "messages/indexation/fiware/cmdexe")
            .subscribe((err, data) => {
                const messageId = IOTA_CLIENT.getMessageId(data.payload);
                IOTA_CLIENT.getMessage()
                    .data(messageId)
                    .then((messageData) => {
                        Northbound.commandResponse(messageData);
                    });
            });
    })
    .catch((err) => {
        debug(err);
    });
```

<a name="mqtt-iota-gateway-southbound---sample-code"></a>

### MQTT-IOTA ゲートウェイ・サウスバウンド - サンプル・コード

サウスバウンド・トラフィックの場合、API キーとデバイス ID が MQTT トピックから抽出され、IOTA ペイロードに移されます。
IOTA ペイロードの構文 (`i`, `k` および `d` 属性を使用) は、
[Ultralight HTTP 構文](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#http-binding)
に基づいています。 次に、`message` は適切なインデックスを使用して Tangle に永続化されます:

```javascript
function command(topic = "cmd", message) {
    const parts = topic.toString().split("/");
    const apiKey = parts[1];
    const deviceId = parts[2];
    const action = parts[3];
    forwardAsIOTATangle(apiKey, deviceId, message.toString(), action);
}

function forwardAsIOTATangle(apiKey, deviceId, state, topic) {
    const payload = "i=" + deviceId + "&k=" + apiKey + "&d=" + state;
    IOTA_CLIENT.message()
        .index("fiware/" + topic)
        .data(payload)
        .submit()
        .then((message) => {
            debug("messageId: " + message.messageId);
        });
}
```

<a name="mqtt-iota-gateway-northbound---sample-code"></a>

### MQTT-IOTA ゲートウェイ・ノースバウンド - サンプル・コード

ノースバウンド・トラフィックも同様です。ペイロードは IOTA Tangle から受信され、マーシャリングされていない状態で API
キーとデバイス ID が明らかになり、適切な MQTT トピックに投稿されます。

```javascript
function unmarshall(payload) {
    const parts = payload.split("&");
    const obj = {};
    parts.forEach((elem) => {
        const keyValues = elem.split("=");
        obj[keyValues[0]] = keyValues[1];
    });
    return obj;
}

function measure(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, "hex").toString("utf8");
    const data = unmarshall(payload);
    forwardAsMQTT(data.k, data.i, data.d, "attrs");
}

function forwardAsMQTT(apiKey, deviceId, state, topic) {
    const mqttTopic = "/" + apiKey + "/" + deviceId + "/" + topic;
    MQTT_CLIENT.publish(mqttTopic, state);
}
```

MQTT-IOTA ゲートウェイの[完全なコード](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/NGSI-v2/iota-gateway/app)
には、次のイベント・ループの反復まで関数の実行を延期するための追加のエラー処理と非同期データ処理が含まれています。

<a name="iota-tangle-device---sample-code"></a>

## IOTA Tangle デバイス - サンプル・コード

デバイスが IOTA Tangle に接続するためのコードは、デバイス上で繰り返されます。アクチュエータは、コマンドの通知を受けるため
に、合意されたトピックをリッスンする必要があります。`process.nextTick()` を使用して、コマンドを見逃さないようにし、時間が
許せば処理できるようにすることができます。

```javascript
const iotaClient = require("@iota/client");
const IOTA_CLIENT = new iotaClient.ClientBuilder().node("https://chrysalis-nodes.iota.cafe").build();

IOTA_CLIENT.getInfo().then(() => {
    IOTA_CLIENT.subscriber()
        .topic("messages/indexation/cmd")
        .subscribe((err, data) => {
            return process.nextTick(() => {
                readFromTangle(data);
            });
        });
});

function readFromTangle(data) {
    const messageId = IOTA_CLIENT.getMessageId(payload);
    IOTA_CLIENT.getMessage()
        .data(messageId)
        .then((messageData) => {
            const payload = Buffer.from(messageData.message.payload.data, "hex").toString("utf8");
            Southbound.processIOTAMessage(messageId, payload);
        });
}
```

<a name="iota-tangle-device-command-acknowledgement"></a>

### IOTA Tangle デバイスのコマンドの確認

実際のデバイスの場合、正常に作動した場合のコールバックにより、確認応答 (acknowledgement) が送信されます。 確認応答は
キューに入れられ、順番に送信されます。エラーが発生した場合は、確認応答を再送する必要があります。そうしないと、
コマンドは `PENDING` の状態のままになります。

```javascript
 processIOTAMessage(apiKey, deviceId, message) {
        const keyValuePairs = message.split('|') || [''];
        const command = getUltralightCommand(keyValuePairs[0]);
        process.nextTick(() => {
            IoTDevices.actuateDevice(deviceId, command)
            .then((response) => {
                queue.push({ responsePayload, deviceId, command });
            });
        });
    }
```

```javascript
const async = require("async");
const queue = async.queue((data, callback) => {
    IOTA_CLIENT.message()
        .index("fiware/cmdexe")
        .data(data.responsePayload)
        .submit()
        .then((response) => {
            callback();
        })
        .catch((err) => {
            setTimeout(() => {
                queue.push(data);
            }, 1000);
            callback(err);
        }, 8);
});
```

<a name="iota-tangle-device-measure---sample-code"></a>

### IOTA Tangle デバイスの測定- サンプル・コード

測定値も同様に取り扱われます。ペイロードは Ultralight 構文 (タイムスタンプを含む) で作成され、キューにプッシュ
されます。キューは測定値を IOTA Tangle に送信し、障害があれば再スケジュールします。

```javascript
sendAsIOTA(deviceId, state) {
    const payload =
        'i=' + deviceId + '&k=' + getAPIKey(deviceId) + '&d=' + state + '|t|' + new Date().toISOString();
    queue.push(payload);
}
```

```javascript
const async = require("async");

const queue = async.queue((payload, callback) => {
    IOTA_CLIENT.message()
        .index("fiware/attrs")
        .data(payload)
        .submit()
        .then((message) => {
            callback();
        })
        .catch((err) => {
            setTimeout(() => {
                // resending measure
                queue.push(payload);
            }, 1000);
            callback(err);
        }, 8);
});
```

<a name="next-steps"></a>

# 次のステップ

高度な機能を追加することで、アプリケーションに複雑さを加える方法を知りたいですか
？このシリーズ
の[他のチュートリアル](https://www.letsfiware.jp/fiware-tutorials)を読むことで見
つけることができます

---

## License

[MIT](LICENSE) © 2021-2024 FIWARE Foundation e.V.
