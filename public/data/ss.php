<?php
$expId = "cas00";
$expGroupNum = 1;
$groupMaxNum = 30;

$data = json_decode(file_get_contents("status.json"), true);
/**
 * @param data Object []
 */
if(is_null($data)) {
    $data = array(
        "group" => array(),
        "lastId" => 0,
        "status" => array(
            "admin" => array(
                0, time(), 0, 0
            )
        )
    );
    for ($i=0; $i < $expGroupNum; $i++) { 
        # code...
        $data["group"][] = array();
    }
}
$result = array();
if (!isset($_GET["id"])) {
    $lastKey = $data["lastId"];
    $lastKey += 1;

    // 加入到 分组中
    $groupIndex = $_POST["group"] ? $_POST["group"] : 0;
    if(!$_POST["group"]) {
        foreach($data["group"] as $key => $value) {
            if(count($data["group"][$groupIndex]) > count($value)) {
                $groupIndex = $key;
            }
        }
    }

    if (count($data["group"][$groupIndex]) > $groupMaxNum) {
        $result["error"] = "人数已达到上限，若您继续尝试，将无法获取报酬。";
    }
    $data["group"][$groupIndex][] = $expId."_".sprintf('%04s', $lastKey);
    $data['status'][$expId."_".sprintf('%04s', $lastKey)] = [1, time(), $lastKey, $groupIndex + 1];
    $data["lastId"] = $lastKey;

    $result["id"] = $expId."_".sprintf('%04s', $lastKey);
    $result["cond"] = $groupIndex + 1;
    goto end;
}

$subjIdx = $_GET["id"];
if(!isset($data["status"][$subjIdx])) {
    $result["error"] = "ID not vaild";
    goto end;
}

if (isset($_GET["action"])) {
    switch ($_GET["action"]) {
        case  "change":
            if ($data["status"][$subjIdx][0] <= 0) goto end;
            if(!$_GET["group"]) goto end;

            // 修改组别
            $old = $data["status"][$subjIdx][3] - 1;
            $new = (int)$_GET["group"] - 1;
            if($old < 0 || $new < 0) goto end;
            if($new >= count($data["group"])) {
                $result["error"] = "对应组别不存在";
                goto end;
            }
            if (($key = array_search($subjIdx, $data["group"][$old]) + 1)) {
                unset($data["group"][$old][$key - 1]);
            }
            $data["group"][$new][] = $subjIdx;
            if (count($data["group"][$new]) > $groupMaxNum) {
                $result["error"] = "人数已达到上限，若您继续尝试，将无法获取报酬。";
            }
            $result["cond"] = $new + 1;
            break;
        case "update":
            if ($data["status"][$subjIdx][0] <= 0) goto end;
            $data["status"][$subjIdx][0] += 1;
            updata:
            $data["status"][$subjIdx][1] = time();
            break;
        case "quit":
            if ($data["status"][$subjIdx][0] <= 0) goto end;
            $group = $data["status"][$subjIdx][3] - 1;
            $data["group"][$group] = array_diff($data["group"][$group], [$subjIdx]);
            $data["status"][$subjIdx][0] = -1;
            goto updata;
            break;
        case "finish":
            if ($data["status"][$subjIdx][0] <= 0) goto end;
            $data["status"][$subjIdx][0] = 0;
            goto updata;
            break;
        case "check":
            foreach($data["status"] as $key => $value) {
                if ($value[0] > 0 and time() - $value[1] > 60 * 30) {
                    $data["status"][$key][0] = -11;
                } else if ($value[0] < -10) {
                    $group = $value[3] - 1;
                    $data["group"][$group] = array_values(array_diff($data["group"][$group], [$key]));
                    $data["status"][$key][0] = -2;
                }
            }
            break;
    }
}

end:
$result["success"] = 1;
echo json_encode($result);
file_put_contents("status.json", json_encode($data));