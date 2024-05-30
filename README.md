[![FIWARE Banner](https://fiware.github.io//tutorials.IoT-over-IOTA/img/fiware.png)](https://www.fiware.org/developers)

[![FIWARE IoT Agents](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/iot-agents.svg)](https://github.com/FIWARE/catalogue/blob/master/iot-agents/README.md)
[![License: MIT](https://img.shields.io/github/license/fiware/tutorials.IoT-over-MQTT.svg)](https://opensource.org/licenses/MIT)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)
[![UltraLight 2.0](https://img.shields.io/badge/Payload-Ultralight-27ae60.svg)](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual)

This tutorial extends the connection of IoT devices connecting to FIWARE to use an alternate transport. The
[UltraLight 2.0](https://fiware-iotagent-ul.readthedocs.io/en/latest/usermanual/index.html#user-programmers-manual) IoT
Agent created in the [previous tutorial](https://github.com/FIWARE/tutorials.IoT-Agent) is reconfigured to communicate
with a set of dummy IoT devices which transfer secure messages over the
[IOTA Tangle](https://www.iota.org/get-started/what-is-iota). An additional gateway component is added to the
architecture of the previous [MQTT tutorial](https://github.com/FIWARE/tutorials.IoT-over-MQTT) to allow for secure
indelible transactions across a distributed ledger network.

The tutorial is mainly concerned with the architecture of the custom components, but uses [cUrl](https://ec.haxx.se/)
commands where necessary, and is also available as

[Postman documentation](https://www.postman.com/downloads/).

# Start-Up

## NGSI-v2 Smart Supermarket

**NGSI-v2** offers JSON based interoperability used in individual Smart Systems. To run this tutorial with **NGSI-v2**, use the `NGSI-v2` branch.

```console
git clone https://github.com/FIWARE/tutorials.IoT-over-IOTA.git
cd tutorials.IoT-over-IOTA
git checkout NGSI-v2

./services create
./services start
```

| [![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/) | :books: [Documentation](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/NGSI-v2) | <img src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/postman.svg" height="15" width="15"> [Postman Collection](https://fiware.github.io/tutorials.IoT-over-IOTA/) |
| --- | --- | --- |

<!--
## NGSI-LD Smart Farm

**NGSI-LD** offers JSON-LD based interoperability used for Federations and Data Spaces. To run this tutorial with **NGSI-LD**, use the `NGSI-LD` branch.

```console
git clone https://github.com/FIWARE/tutorials.IoT-over-IOTA.git
cd tutorials.IoT-Agent
git checkout NGSI-LD

./services create
./services start
```

| [![NGSI LD](https://img.shields.io/badge/NGSI-LD-d6604d.svg)](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim009v010801p.pdf) | :books: [Documentation](https://github.com/FIWARE/tutorials.IoT-over-IOTA/tree/NGSI-LD) | <img  src="https://cdn.jsdelivr.net/npm/simple-icons@v3/icons/postman.svg" height="15" width="15"> [Postman Collection](https://fiware.github.io/tutorials.IoT-over-IOTA/ngsi-ld.html) |
| --- | --- | --- |
-->

---

## License

[MIT](LICENSE) © 2021-2024 FIWARE Foundation e.V.
