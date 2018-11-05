module Icons exposing (IconFunction, account, bigCross, bigTick, cozyBig, dashboard, folder, globe, grey, help, icon, path, polygon, settings, white)

import Html exposing (..)
import Html.Attributes exposing (..)
import Svg exposing (Svg, node, path, svg)
import Svg.Attributes exposing (d, fill, fillRule, viewBox)


type alias IconFunction msg =
    Int -> Bool -> Svg msg


white : String
white =
    "#fff"


grey : String
grey =
    -- grey-06
    "#748192"


icon : Int -> List (Svg msg) -> IconFunction msg
icon viewbox paths size active =
    let
        color =
            if active then
                white

            else
                grey

        stringSize =
            String.fromInt size

        viewboxSize =
            "0 0 " ++ String.fromInt viewbox ++ " " ++ String.fromInt viewbox
    in
    Svg.svg
        [ Svg.Attributes.width stringSize
        , Svg.Attributes.height stringSize
        , Svg.Attributes.viewBox viewboxSize
        , Svg.Attributes.fill color
        ]
        paths


path : String -> Svg msg
path d =
    Svg.path [ Svg.Attributes.d d ] []


polygon : String -> Svg msg
polygon points =
    Svg.polygon [ Svg.Attributes.points points ] []


account : IconFunction msg
account =
    icon 16
        [ path "M8,10c2.209,0,4-1.791,4-4V4c0-2.209-1.791-4-4-4s-4,1.791-4,4v2C4,8.209,5.791,10,8,10z"
        , path "M15.999,15v-3.001c0-0.207-0.026-0.408-0.065-0.608c0.137,0.698,0.096-1.354-2.168-2.822c-0.086-0.057-0.188-0.104-0.277-0.158C12.559,10.521,10.455,12,8,12s-4.559-1.479-5.488-3.59c-0.091,0.054-0.191,0.101-0.279,0.158c-2.2,1.428-2.379,3.623-2.121,2.637C0.136,11.113,0,11.637,0,12v3c0,0.139,0.028,0.27,0.079,0.389C0.23,15.748,0.586,16,1,16h14c0.414,0,0.77-0.252,0.922-0.611C15.973,15.27,16,15.139,15.999,15L15.999,15z"
        ]


dashboard : IconFunction msg
dashboard =
    icon 16
        [ path "M8.991,12H7.009C6.452,12,6,12.443,6,13.01v1.98C6,15.548,6.443,16,7.009,16h1.981C9.548,16,10,15.557,10,14.99v-1.98 C10,12.452,9.557,12,8.991,12z"
        , path "M2.991,0H1.009C0.452,0,0,0.443,0,1.009v1.981C0,3.548,0.443,4,1.009,4h1.981C3.548,4,4,3.557,4,2.991V1.009 C4,0.452,3.557,0,2.991,0z"
        , path "M8.991,6H7.009C6.452,6,6,6.443,6,7.009V8.99C6,9.548,6.443,10,7.009,10h1.981C9.548,10,10,9.557,10,8.99V7.009 C10,6.452,9.557,6,8.991,6z"
        , path "M2.991,12H1.009C0.452,12,0,12.443,0,13.01v1.98C0,15.548,0.443,16,1.009,16h1.981C3.548,16,4,15.557,4,14.99v-1.98 C4,12.452,3.557,12,2.991,12z"
        , path "M2.991,6H1.009C0.452,6,0,6.443,0,7.009V8.99C0,9.548,0.443,10,1.009,10h1.981C3.548,10,4,9.557,4,8.99V7.009 C4,6.452,3.557,6,2.991,6z"
        , path "M14.991,0h-1.981C12.452,0,12,0.443,12,1.009v1.981C12,3.548,12.443,4,13.009,4h1.981C15.548,4,16,3.557,16,2.991V1.009 C16,0.452,15.557,0,14.991,0z"
        , path "M14.991,6h-1.981C12.452,6,12,6.443,12,7.009V8.99C12,9.548,12.443,10,13.009,10h1.981C15.548,10,16,9.557,16,8.99V7.009 C16,6.452,15.557,6,14.991,6z"
        , path "M14.991,12h-1.981C12.452,12,12,12.443,12,13.01v1.98c0,0.558,0.443,1.01,1.009,1.01h1.981C15.548,16,16,15.557,16,14.99 v-1.98C16,12.452,15.557,12,14.991,12z"
        , path "M8.991,0H7.009C6.452,0,6,0.443,6,1.009v1.981C6,3.548,6.443,4,7.009,4h1.981C9.548,4,10,3.557,10,2.991V1.009 C10,0.452,9.557,0,8.991,0z"
        ]


help : IconFunction msg
help =
    icon 16
        [ polygon "5,14 7,16 9,16 11,14 11,13 5,13"
        , path "M8,0c-3.313,0-6,2.687-6,6c0,2.221,1.207,4.16,3,5.197V12h6v-0.803C12.793,10.16,14,8.221,14,6C14,2.687,11.313,0,8,0z"
        ]


settings : IconFunction msg
settings =
    icon 24
        [ path "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" ]


folder : IconFunction msg
folder =
    icon 16
        [ Svg.g
            [ Svg.Attributes.fillRule "evenodd"
            , Svg.Attributes.transform "translate(-32 -32)"
            ]
            [ path "M32,34.0068455 C32,33.4507801 32.4509752,33 32.990778,33 L37.5089948,33 C37.7801695,33 38.1569366,33.1569366 38.3483734,33.3483734 L39.6516266,34.6516266 C39.8440279,34.8440279 40.2307968,35 40.5004358,35 L47.0029699,35 C47.5536144,35 48,35.455761 48,36.0024733 L48,44.9914698 C48,46.1007504 47.1054862,47 46.0059397,47 L33.9940603,47 C32.8927712,47 32,46.1029399 32,44.9941413 L32,34.0068455 Z M32,37 L48,37 L48,38 L32,38 L32,37 Z"
            ]
        ]


globe : IconFunction msg
globe =
    icon 16
        [ path "M7.889 13.999L7 10 6 9 4 6l-.355-2.128A6 6 0 0 0 7.888 14zm.238-11.998L10 3.5V5L8 6.5l-1.5 1 .5 1 3 .5 1 1v1.5l-1.549 2.323A6 6 0 0 0 8.127 2.001zM8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16z" ]


cozyBig =
    figure []
        [ div [ class "svg-wrapper" ]
            [ svg [ id "svg-cozy-icon", viewBox "0 0 52 52" ]
                [ Svg.path
                    [ d "M558.23098,44 L533.76902,44 C526.175046,44 520,37.756072 520,30.0806092 C520,26.4203755 521.393962,22.9628463 523.927021,20.3465932 C526.145918,18.0569779 529.020185,16.6317448 532.129554,16.2609951 C532.496769,13.1175003 533.905295,10.2113693 536.172045,7.96901668 C538.760238,5.40737823 542.179607,4 545.800788,4 C549.420929,4 552.841339,5.40737823 555.429532,7.96796639 C557.686919,10.2008665 559.091284,13.0912433 559.467862,16.2179336 C566.482405,16.8533543 572,22.8284102 572,30.0816594 C572,37.756072 565.820793,44 558.22994,44 L558.23098,44 Z M558.068077,40.9989547 L558.171599,40.9989547 C564.142748,40.9989547 569,36.0883546 569,30.0520167 C569,24.0167241 564.142748,19.1061239 558.171599,19.1061239 L558.062901,19.1061239 C557.28338,19.1061239 556.644649,18.478972 556.627051,17.6887604 C556.492472,11.7935317 551.63729,7 545.802791,7 C539.968291,7 535.111039,11.7956222 534.977495,17.690851 C534.959896,18.4664289 534.34187,19.0914904 533.573737,19.1092597 C527.743378,19.2451426 523,24.1536522 523,30.0530619 C523,36.0893999 527.857252,41 533.828401,41 L533.916395,41 L533.950557,40.9979094 C533.981614,40.9979094 534.01267,40.9979094 534.043727,41 L558.064971,41 L558.068077,40.9989547 Z M553.766421,29.2227318 C552.890676,28.6381003 552.847676,27.5643091 552.845578,27.5171094 C552.839285,27.2253301 552.606453,26.9957683 552.32118,27.0000592 C552.035908,27.0054228 551.809368,27.2467844 551.814612,27.5364185 C551.81671,27.5750363 551.831393,28.0792139 552.066323,28.6735 C548.949302,31.6942753 544.051427,31.698566 540.928113,28.6917363 C541.169336,28.0888684 541.185068,27.576109 541.185068,27.5374911 C541.190312,27.2478572 540.964821,27.0086409 540.681646,27.0011319 C540.401618,26.9925502 540.163541,27.2264027 540.154102,27.5160368 C540.154102,27.5589455 540.11215,28.6370275 539.234308,29.2216592 C538.995183,29.3825669 538.92806,29.7097461 539.08433,29.9532532 C539.182917,30.1077246 539.346529,30.1924694 539.516434,30.1924694 C539.612923,30.1924694 539.710461,30.1645787 539.797512,30.1066519 C540.023003,29.9564713 540.211786,29.7848363 540.370154,29.6024742 C542.104862,31.2008247 544.296845,32 546.488828,32 C548.686055,32 550.883282,31.1976066 552.621136,29.5917471 C552.780553,29.7762546 552.971434,29.9521804 553.203218,30.1066519 C553.289219,30.1645787 553.387806,30.1924694 553.484295,30.1924694 C553.652102,30.1924694 553.816763,30.1066519 553.916399,29.9521804 C554.07162,29.7076006 554.004497,29.3793488 553.766421,29.2205864 L553.766421,29.2227318 Z"
                    , fill "#FFFFFF"
                    , attribute "fill-rule" "evenodd"
                    , attribute "transform" "translate(-520)"
                    ]
                    []
                ]
            ]
        ]


bigTick =
    figure []
        [ div [ class "svg-wrapper svg-tick-wrapper" ]
            [ svg [ viewBox "0 0 24 24" ]
                [ Svg.path
                    [ d "M0 0h24v24H0z"
                    , fill "none"
                    ]
                    []
                , Svg.path
                    [ d "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
                    , fill "#FFFFFF"
                    ]
                    []
                ]
            ]
        ]


{-| FIXME: Not the same as <https://marvelapp.com/2je726b/screen/36177790>
-}
bigCross =
    figure []
        [ div [ class "svg-wrapper svg-tick-wrapper" ]
            [ svg [ viewBox "0 0 96 96" ]
                [ Svg.g
                    [ style "stroke" "none"
                    , style "stroke-width" "1"
                    , style "fill" "none"
                    , style "fill-rule" "evenodd"
                    ]
                    [ Svg.g
                        [ style "stroke" "white"
                        , style "stroke-linecap" "round"
                        , style "stroke-width" "5"
                        ]
                        [ Svg.path [ d "M20,20 L76,76" ] []
                        , Svg.path [ d "M20,76 L76,20" ] []
                        ]
                    ]
                ]
            ]
        ]
