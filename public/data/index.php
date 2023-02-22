<!DOCTYPE html>
<html>
<head>
    <style>
        .box{
        display: inline-block;
        width: 95%;
        vertical-align: top;
        margin: 20px 0;
        }
        .qgg-table{
    border-collapse: collapse;
    width:100%;
    border:1px solid #c6c6c6 !important;
    margin-bottom:20px;
}
.qgg-table th{
    border-collapse: collapse;
    border-right:1px solid #c6c6c6 !important;
    border-bottom:1px solid #c6c6c6 !important;
    background-color:#ddeeff !important; 
    padding:5px 9px;
    font-size:14px;
    font-weight:normal;
    text-align:center;
}
.qgg-table td{
    border-collapse: collapse;
    border-right:1px solid #c6c6c6 !important;
    border-bottom:1px solid #c6c6c6 !important; 
    padding:5px 9px;
    font-size:12px;
    font-weight:normal;
    text-align:center;
    word-break: break-all;
}
.qgg-table tr:nth-child(odd){
    background-color:#fff !important; 
}
.qgg-table tr:nth-child(even){
    background-color: #f8f8f8 !important;
}
    </style>
</head>

<body>
    <h1>CAS10 数据汇总</h1>
    <?php
        $file = opendir("./origin");
        while(($filename =readdir($file)) !== false) { 
            if($filename != "." && $filename != "..") {
                $files[] = $filename;
                $times[] = date("Y-m-d H:i:s", filemtime("./origin/".$filename));
            }
        }
        closedir($file);
        // sort($files);
        array_multisort($times, $files);
    ?>
    <div class="box">
        <table class="qgg-table">
        <thead>
<tr>
<th width="25%">link1</th>
<th width="25%">link2</th>
<th width="25%">link3</th>
<th width="25%">link4</th>
</tr>
</thead>
<tbody>
        <?php 
        $r = [
            [],
            [],
            [],
            []
        ];
        $maxNum = 0;
        foreach($files as $f) {
            if (preg_match_all("/link(\d)/i", $f, $matchs) & !$r[(int)$matchs[1][0] - 1]) {
                echo "<br />";
                $r[(int)$matchs[1][0] - 1] = array($f);
                if(count($r[(int)$matchs[1][0] - 1]) > $maxNum) {
                    $maxNum = count($r[(int)$matchs[1][0] - 1]);
                }
            } else if (preg_match_all("/link(\d)/i", $f, $matchs)) {
                array_push($r[(int)$matchs[1][0] - 1], $f);
                if(count($r[(int)$matchs[1][0] - 1]) > $maxNum) {
                    $maxNum = count($r[(int)$matchs[1][0] - 1]);
                }
            }
        }
        for ($i=0; $i < $maxNum; $i++) { 
            echo "<tr>";
            echo isset($r[0][$i]) ? "<td><a href='./origin/".$r[0][$i]."'>".$r[0][$i]."</a></td>" : "<td></td>";
            echo isset($r[1][$i]) ? "<td><a href='./origin/".$r[1][$i]."'>".$r[1][$i]."</a></td>" : "<td></td>";
            echo isset($r[2][$i]) ? "<td><a href='./origin/".$r[2][$i]."'>".$r[2][$i]."</a></td>" : "<td></td>";
            echo isset($r[3][$i]) ? "<td><a href='./origin/".$r[3][$i]."'>".$r[3][$i]."</a></td>" : "<td></td>";
            echo isset($r[4][$i]) ? "<td><a href='./origin/".$r[4][$i]."'>".$r[4][$i]."</a></td>" : "<td></td>";
            echo "</tr>";
        }
        // foreach($r as $i) {
        //     echo "<tr>";
        //     $i1 = $i;
        //     uasort($i, "my_sort");
        //         foreach($i as $c) {
        //             echo "<td><a href='./origin/".$c."'>".$c."</a></td>";
        //         }
        //     echo "</tr>";
        // }
        ?>
</tbody>
        </table>
    </div>
</body>
</html>